class SearchView {
  _parentElement = document.querySelector('.search');

  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();

    return query;
  }

  // 用于每次搜索完recipe后清除input框的内容
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  // 这个参数handler，就是controller模块的controlSearchResults函数
  addHandlerSearch(handler) {
    // 用户点击“search”，还是按下enter，都会触发事件
    // 💡：每次触发提交事件时，都需要prevent一下默认事件的发生；如果不这样，页面就会重新加载
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
