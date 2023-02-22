import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';

import 'core-js/stable';
import 'regenerator-runtime';
import { async } from 'regenerator-runtime';
import { MODAL_CLOSE_SEC } from './config';

// https://forkify-api.herokuapp.com/v2

/////////////////////////////////////
// Hot Module Replacement is a feature that enables you to see code changes in the browser without having to refresh it, allowing you to preserve the state of your front-end application.
if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    // Get current id from browser, 返回一个`USVString`，其中会包含 URL 标识中的 '#' 和 后面 URL 片段标识符
    const id = window.location.hash.slice(1);

    if (!id) return; // 如果没有id（假设刚打开首页），那就跳过controlRecipes下面的代码
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id); // This is actually an async function, so we have to await this promise before moving on in next step

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // 添加旋转圈圈给results
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

// 这个是拿来给用户增加serving人数时自动增加ingredient数量的函数
const controlServings = function (newServings) {
  // Update recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  // 因为每次增加serving人数的时候，上面的图片都会一闪一闪的，所以我们就不用render函数了，再写一个update函数来消除这种闪烁
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  // 这里是为了渲染我们的bookmark button为fill形状
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome app!');
};

// 用view模块处理我们的在各个children-view中事件
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  newFeature();
};

init();

// window.addEventListener('hashchange', controlRecipes);
// 🤔 监听load事件的原因 ⬇️
// 假设一个情景：我们复制当前带有hash值的url到另一个窗口打开，但此时新的窗口并没有发生hashChange事件，所以recipe是不会渲染到页面的，那我们要解决这个新窗口没有渲染recipe的问题，我们应该再监听一个load事件，当所有file或资源被加载完成，我们就能渲染recipe，所以只需要再新增一个load事件监听就行了
// window.addEventListener('load', controlRecipes);

// 为了解决上面事件监听代码的重复问题，我们可以 ⬇️
// ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, controlRecipes));
