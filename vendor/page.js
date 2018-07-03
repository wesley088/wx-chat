// 缓存pageModel
class PM {
 constructor() {
  this.$$cache = {};
 }
 
 add(pageModel) {
  let pagePath = this._getPageModelPath(pageModel);
 
  this.$$cache[pagePath] = pageModel;
 }
 
 get(pagePath) {
  return this.$$cache[pagePath];
 }
  
 delete(pageModel) {
  try {
   delete this.$$cache[this._getPageModelPath(pageModel)];
  } catch (e) {
  }
 }
 
 _getPageModelPath(page) {
  // 核心是用了Page对象的私有属性__route__
  return page.__route__;
 }
}

module.exports.PM = PM;