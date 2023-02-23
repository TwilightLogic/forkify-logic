import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Logic
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    // Remove the message at the beginning
    this._clear();

    // Insert HTML in parent element
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // 这里会创建一个新的dom元素
    const newDOM = document.createRange().createContextualFragment(newMarkup);

    // 用Array.from()把NodeList转换成Array
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // 比较oldHTML和newHTML的不同，然后替换
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // 这里可以比较新旧HTML的结点Node是否一样
      // console.log(curEl, newEl.isEqualNode(curEl));

      // 这里update了改变的TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // 这里update了改变的ATTRIBUTES
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  renderSpinner = function () {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;

    this._clear;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  };

  // 加载或渲染失败 ⬇️
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 加载或渲染成功 ⬇️
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Remove the message at the beginning
  _clear() {
    this._parentElement.innerHTML = '';
  }

  // 将controller模块的事件处理放在view模块中
  // 通过publisher-subscriber设计模式，将controlRecipes函数通过init初始化函数来传进view模块
  // ⬆️ 其实就是在controller模块调用view模块的addHandlerRender(controlRecipes)
  // addHandlerRender(handler) {
  //   ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  // }
}
