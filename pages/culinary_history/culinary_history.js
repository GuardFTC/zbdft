//固定常量
const PAGE_SIZE = 3;
const OEG_DATA = [{
    date: "2021-01-01",
    breakfast: {
      main: "米饭",
      meat: "榨菜炒肉",
      veg: "西红柿炒鸡蛋",
      fruit: "草莓"
    },
    lunch: {
      main: "米饭",
      meat: "宫保鸡丁",
      veg: "青椒炒肉",
      fruit: "苹果"
    },
    dinner: {
      main: "米饭",
      meat: "红烧肉",
      veg: "西兰花炒鸡蛋",
      fruit: "橙子"
    }
  },
  {
    date: "2021-01-02",
    breakfast: {
      main: "面包",
      meat: "香肠",
      veg: "鸡蛋炒西红柿",
      fruit: "香蕉"
    },
    lunch: {
      main: "面条",
      meat: "回锅肉",
      veg: "清炒时蔬",
      fruit: "葡萄"
    },
    dinner: {
      main: "米饭",
      meat: "烧鸭",
      veg: "小炒黄牛肉",
      fruit: "西瓜"
    }
  },
  {
    date: "2021-01-03",
    breakfast: {
      main: "粥",
      meat: "大排骨",
      veg: "黄花菜炒蛋",
      fruit: "柚子"
    },
    lunch: {
      main: "米饭",
      meat: "回锅肉",
      veg: "青菜炒香菇",
      fruit: "苹果"
    },
    dinner: {
      main: "米饭",
      meat: "水煮鱼",
      veg: "炖排骨",
      fruit: "梨"
    }
  },
  {
    date: "2021-01-04",
    breakfast: {
      main: "煎饼",
      meat: "炒肝",
      veg: "大葱拌豆腐",
      fruit: "柠檬"
    },
    lunch: {
      main: "米饭",
      meat: "红烧牛肉",
      veg: "炒茄子",
      fruit: "草莓"
    },
    dinner: {
      main: "米饭",
      meat: "黄鱼炒面",
      veg: "酸辣土豆丝",
      fruit: "橙子"
    }
  },
  {
    date: "2021-01-05",
    breakfast: {
      main: "豆浆",
      meat: "油条",
      veg: "韭菜炒蛋",
      fruit: "橙子"
    },
    lunch: {
      main: "米饭",
      meat: "红烧肉",
      veg: "凉拌苦瓜",
      fruit: "葡萄"
    },
    dinner: {
      main: "米饭",
      meat: "鸡胸肉",
      veg: "番茄炒蛋",
      fruit: "西瓜"
    }
  }
]

//数据库连接
const db = wx.cloud.database();
const dailyMenuCollection = db.collection('daily_menu')

Page({

  //数据相关
  data: {

    //页面数据相关
    pageData: [], // 当前页的数据
    totalPages: 0, // 总页数
    pageNum: 1, // 当前页

    //导航栏相关数据
    statusBarHeight: 0, // 状态栏高度
    navigationBarHeight: 44, // 导航栏默认高度（单位：px）
  },

  //---------------------------钩子函数相关--------------------------//
  //钩子函数，页面初始化时调用
  onLoad: function () {

    //1.更新当前页数据
    this.updatePageData();

    //2.获取导航栏高度
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight, // 获取状态栏高度
    });
  },

  //---------------------------页面函数相关--------------------------//
  // 更新当前页数据
  async updatePageData() {

    //1.定义相关数据
    const {
      pageNum
    } = this.data;

    //2.获取分页数据
    const {
      total,
      data
    } = await this.getPageInfo(pageNum);

    //3.计算总页数
    const totalPages = Math.ceil(total / PAGE_SIZE);

    //4.设置当前页数据,总页数
    this.setData({
      pageData: data,
      totalPages: totalPages,
    });
  },

  // 上一页
  previousPage: function () {

    //1.页数异常返回
    if (this.data.pageNum <= 1) {
      return
    }

    //2.设置当前页
    this.setData({
      pageNum: this.data.pageNum - 1
    });

    //3.更新当前页数据
    this.updatePageData();
  },

  // 下一页
  nextPage: function () {

    //1.页数异常返回
    if (this.data.pageNum >= this.data.totalPages) {
      return
    }

    //2.设置当前页
    this.setData({
      pageNum: this.data.pageNum + 1
    });

    //3.更新当前页数据
    this.updatePageData();
  },

  //---------------------------数据库函数相关------------------------//
  // 查询分页数据和总数据数量的函数
  async getPageInfo(pageNum) {
    try {

      //1.查询总数据数量
      const countRes = await dailyMenuCollection.count();
      const totalCount = countRes.total;

      //2.查询分页数据
      const pageRes = await dailyMenuCollection
        .orderBy('date', 'desc')
        .skip((pageNum - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .get();
      const pageData = pageRes.data;

      //3. 返回结果
      return {
        total: totalCount,
        data: pageData,
      };
    } catch (err) {
      console.error('查询失败', err);
      throw err;
    }
  },
});