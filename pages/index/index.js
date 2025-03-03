//固定常量
// 主食类型的名称数组
const MAIN_FOODS = [
  "米饭", "面条", "包子", "饺子", "馒头", "炒饭", "粥", "花卷", "炸酱面", "油条"
];

// 肉菜类型的名称数组
const MEAT_FOODS = [
  "红烧肉", "宫保鸡丁", "鱼香肉丝", "清蒸鲈鱼", "麻辣小龙虾", "牛肉炖土豆", "羊肉串", "烤鸭", "炸鸡翅", "卤肉饭"
];

// 素菜类型的名称数组
const VEGGIE_FOODS = [
  "麻辣豆腐", "清炒时蔬", "蒜蓉西兰花", "地三鲜", "炒土豆丝", "蚝油生菜", "凉拌黄瓜", "红烧茄子", "香菇炒青菜", "素炒豆腐"
];

// 水果类型的名称数组
const FRUITS = [
  "苹果", "香蕉", "橙子", "葡萄", "西瓜", "草莓", "蓝莓", "菠萝", "芒果", "猕猴桃"
];

Page({

  //数据相关
  data: {

    //页面相关数据
    pageData: null, //当前页数据
    mainFoods: [],
    meatFoods: [],
    veggieFoods: [],
    fruits: [],

    //模态框相关数据
    showModal: false,
    main: "",
    meat: "",
    veg: "",
    fruit: "",
    mealType: ""
  },

  //---------------------------钩子函数相关--------------------------//
  //钩子函数，页面初始化时调用
  onLoad: function () {

    //1.初始化食物相关数组
    this.initFoods();

    //2.更新当前页数据
    this.updatePageData();
  },

  //初始化食物相关数组
  initFoods: function () {

    //------------------------模拟从数据库查询数据--start---------------//
    //------------------------模拟从数据库查询数据--end-----------------//

    //2.设置食物相关数组数据
    this.setData({
      mainFoods: MAIN_FOODS,
      meatFoods: MEAT_FOODS,
      veggieFoods: VEGGIE_FOODS,
      fruits: FRUITS,
    });
  },

  //---------------------------页面函数相关--------------------------//
  // 更新当前页数据
  updatePageData: function () {

    //1.获取今日日期 yyyy-MM-dd
    const date = this.getCurrentDate()
    console.log("今日日期:" + date)

    //------------------------模拟从数据库查询数据--start---------------//
    //------------------------模拟从数据库查询数据--end--------------//

    //3.检查 pageData 是否为 null 或 undefined，如果是，则初始化它
    if (this.data.pageData === null || this.data.pageData === undefined) {
      this.setData({
        pageData: {
          date: date
        }
      });

      //TODO 模拟数据库中插入数据
    } else {
      //TODO 设置pageData为查询出的数据
    }
  },

  // 跳转到厨艺发展史页面
  goToCulinaryHistory: function () {
    wx.navigateTo({
      url: '/pages/culinary_history/culinary_history'
    });
  },

  // 跳转到我滴菜单页面
  goToMyMenu: function () {
    wx.navigateTo({
      url: '/pages/my_menu/my_menu'
    });
  },

  // 随便吃点按钮点击事件
  onRandomMeal: function (event) {

    //1.获取餐食类型
    const mealType = event.currentTarget.dataset.meal;

    //2.构造随机餐食
    const randomMeal = {
      main: this.getRandomItem(this.data.mainFoods),
      meat: this.getRandomItem(this.data.meatFoods),
      veg: this.getRandomItem(this.data.veggieFoods),
      fruit: this.getRandomItem(this.data.fruits)
    };

    //3.动态设置餐食类型
    let pageData = this.data.pageData;
    pageData[mealType] = randomMeal;

    //4.TODO 模拟数据库更新数据

    //5.设置当前页数据 TODO 后续调整为更新页面方法即可
    this.setData({
      pageData: pageData
    });
  },

  // 私人订制按钮点击事件
  onCustomMeal: function (event) {

    //1.获取餐食类型
    const mealType = event.currentTarget.dataset.meal;
    console.log("私人订制点击，餐食类型：" + mealType);

    //2.显示模态框
    this.setData({
      showModal: true,
      main: "",
      meat: "",
      veg: "",
      fruit: "",
      mealType: mealType
    })
  },

  //---------------------------模态框函数相关--------------------------//
  // 主食模态框下拉框选择变化
  onPickerChangeMain: function (e) {

    //1.获取模态框下拉框数据
    const main = this.data.mainFoods[e.detail.value];

    //2.设置数据
    this.setData({
      main: main,
    });
  },

  // 肉菜模态框下拉框选择变化
  onPickerChangeMeat: function (e) {

    //1.获取模态框下拉框数据
    const meat = this.data.meatFoods[e.detail.value];

    //2.设置数据
    this.setData({
      meat: meat,
    });
  },

  // 素菜模态框下拉框选择变化
  onPickerChangeVeg: function (e) {

    //1.获取模态框下拉框数据
    const veg = this.data.veggieFoods[e.detail.value];

    //2.设置数据
    this.setData({
      veg: veg,
    });
  },

  // 水果模态框下拉框选择变化
  onPickerChangeFruit: function (e) {

    //1.获取模态框下拉框数据
    const fruit = this.data.fruits[e.detail.value];

    //2.设置数据
    this.setData({
      fruit: fruit,
    });
  },

  // 确认按钮点击事件
  onConfirm: function () {

    //1.获取模态框相关数据
    const {
      main,
      meat,
      veg,
      fruit,
      mealType
    } = this.data;

    //2.校验输入数据合法性
    if (!main) {
      wx.showToast({
        title: '不吃主食你就完断了!',
        icon: 'none',
      });
      return;
    }

    //3.获取今日日期 yyyy-MM-dd
    const date = this.getCurrentDate()

    //4.查询数据 TODO 模拟数据库查询数据

    //5.构造随机餐食
    const randomMeal = {
      main: main,
      meat: meat,
      veg: veg,
      fruit: fruit
    };

    //6.动态设置餐食类型
    let pageData = this.data.pageData;
    pageData[mealType] = randomMeal;

    //7.TODO 模拟数据库更新数据

    //8.更新成功，关闭模态框，清空数据
    this.setData({
      showModal: false,
      main: "",
      meat: "",
      veg: "",
      fruit: "",
      mealType: ""
    });

    //9.设置当前页数据 TODO 后续调整为更新页面方法即可
    this.setData({
      pageData: pageData
    });
  },

  // 取消按钮点击事件
  onCancel: function () {

    //1.关闭模态框，清空数据
    this.setData({
      showModal: false,
      main: "",
      meat: "",
      veg: "",
      fruit: "",
      mealType: "",
    });
  },

  //---------------------------工具函数相关--------------------------//
  // 获取当前时间 格式yyyy-MM-dd
  getCurrentDate: function () {

    //1/获取当前日期
    const date = new Date();

    //2.获取年月日
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    //3.格式化返回
    return `${year}-${month}-${day}`;
  },

  // 从数组中随机选择一个元素
  getRandomItem: function (arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  },
});