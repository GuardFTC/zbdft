//数据库连接
const db = wx.cloud.database();
const foodCollection = db.collection('foods');
const dailyMenuCollection = db.collection('daily_menu')

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
    mealType: "",

    //导航栏相关数据
    statusBarHeight: 0, // 状态栏高度
    navigationBarHeight: 44, // 导航栏默认高度（单位：px）

    //个人信息相关
    openId: ""
  },

  //---------------------------钩子函数相关--------------------------//
  //钩子函数，页面初始化时调用
  onLoad: function () {

    //1.获取openId
    wx.cloud.callFunction({
        name: 'getOpenId',
        success: function (res) {
          const openId = res.result.openid;
          wx.setStorageSync('openId', openId);
        },
        fail: console.error
      }),

    //2.初始化食物相关数组
    this.initFoods();

    //3.更新当前页数据
    this.updatePageData();

    //4.获取导航栏高度
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight,
    });
  },

  //钩子函数，其他页面返回index时调用
  onShow() {

    //1.初始化食物相关数组
    this.initFoods();
  },

  //初始化食物相关数组
  async initFoods() {

    //1.数据库按照类别聚合name
    const res = await this.getTypes()

    //2.设置食物相关数组数据
    this.setData({
      mainFoods: res['主食'],
      meatFoods: res['肉菜'],
      veggieFoods: res['素菜'],
      fruits: res['水果']
    });
  },

  //---------------------------页面函数相关--------------------------//
  // 更新当前页数据
  async updatePageData() {
    try {

      // 1.获取今日日期 yyyy-MM-dd
      const today = this.getCurrentDate();
  
      // 2.查询今日菜单
      const todayMenu = await this.getTodayMenu(today);
  
      // 3.检查 todayMenu.data 是否存在且不为空
      if (!todayMenu.data || todayMenu.data.length === 0) {

        //4.如果 todayMenu.data 为空，初始化 pageData
        this.setData({
          pageData: {
            date: today
          }
        });
  
        //5.模拟数据库中插入数据
        await this.addTodayMenu(today); // 假设 addTodayMenu 是异步方法
      } else {

        //4.如果 todayMenu.data 不为空，更新 pageData
        this.setData({
          pageData: todayMenu.data[0]
        });
      }
    } catch (error) {
      console.error('更新页面数据失败:', error);
    }
  },

  // 跳转到厨艺发展史页面
  goToCulinaryHistory: function () {

    //1.页面跳转
    wx.navigateTo({
      url: '/pages/culinary_history/culinary_history'
    });
  },

  // 跳转到我滴菜单页面
  goToMyMenu: function () {

    //1.页面跳转
    wx.navigateTo({
      url: '/pages/my_menu/my_menu'
    });
  },

  // 随便吃点按钮点击事件
  async onRandomMeal(event) {

    //1.获取餐食类型
    const mealType = event.currentTarget.dataset.meal;

    //2.构造随机餐食
    const randomMeal = {
      main: this.getRandomItem(this.data.mainFoods),
      meat: this.getRandomItem(this.data.meatFoods),
      veg: this.getRandomItem(this.data.veggieFoods),
      fruit: this.getRandomItem(this.data.fruits)
    };

    //3.数据库更新数据
    await this.updateTodayMenu(this.getCurrentDate(), mealType, randomMeal)

    //4.更新当前页数据
    this.updatePageData()
  },

  // 私人订制按钮点击事件
  onCustomMeal: function (event) {

    //1.获取餐食类型
    const mealType = event.currentTarget.dataset.meal;

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
  async onConfirm() {

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

    //3.构造餐食
    const customMeal = {
      main: main,
      meat: meat,
      veg: veg,
      fruit: fruit
    };

    //4.数据库更新数据
    await this.updateTodayMenu(this.getCurrentDate(), mealType, customMeal)

    //5.更新当前页数据
    this.updatePageData()

    //6.更新成功，关闭模态框，清空数据
    this.setData({
      showModal: false,
      main: "",
      meat: "",
      veg: "",
      fruit: "",
      mealType: ""
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

  //---------------------------数据库函数相关------------------------//
  //查询类别集合
  async getTypes() {
    try {

      //1.分组查询
      const _ = db.command.aggregate
      const res = await foodCollection.aggregate()
        .sort({
          updateTime: -1
        })
        .group({
          _id: {
            openid: '$_openid',
            type: '$type'
          },
          names: _.push('$name')
        })
        .end();

      //2.聚合返回
      return res.list.reduce((result, item) => {
        result[item._id.type] = item.names;
        return result;
      }, {});
    } catch (err) {
      console.error('聚合失败', err);
      throw err;
    }
  },

  // 查询今日菜单
  async getTodayMenu(today) {
    try {

      //1.创建查询条件
      let queryCondition = {
        _openid: wx.getStorageSync('openId'),
        date: today
      };

      //2.查询今日菜单
      const pageRes = await dailyMenuCollection.where(queryCondition)
        .limit(1)
        .get();
      const pageData = pageRes.data;

      //3. 返回结果
      return {
        data: pageData,
      };
    } catch (err) {
      console.error('查询失败', err);
      throw err;
    }
  },

  //添加今日菜单
  async addTodayMenu(today) {
    try {

      // 1.插入数据
      const res = await dailyMenuCollection.add({
        data: {
          date: today,
        },
      });

      // 2.返回插入结果
      console.log('插入成功，记录ID：', res._id);
      return res;
    } catch (err) {
      console.error('插入失败', err);
      throw err;
    }
  },

  //修改今日菜单
  async updateTodayMenu(today, type, meal) {
    try {

      //1.查询是否有日期为 today 的数据
      const res = await dailyMenuCollection
        .where({
          date: today,
        })
        .get();

      //2.如果查询到数据，则更新该记录的 type 字段
      if (res.data.length > 0) {

        //3.获取查询结果中的 id
        const id = res.data[0]._id;

        //4.动态更新字段，字段名由 type 决定
        const updateData = {};
        updateData[type] = meal;

        //5.执行更新操作
        const updateRes = await dailyMenuCollection.doc(id).update({
          data: updateData,
        });

        //6.返回
        console.log('更新成功', updateRes);
        return updateRes;
      } else {
        console.log('没有找到匹配的日期数据');
        return null;
      }
    } catch (err) {
      console.error('更新失败', err);
      throw err;
    }
  },
});