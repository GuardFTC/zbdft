//固定常量
const PAGE_SIZE = 5;
const OEG_DATA = [{
    "id": 1,
    "type": "主食",
    "name": "米饭"
  },
  {
    "id": 2,
    "type": "主食",
    "name": "面条"
  },
  {
    "id": 3,
    "type": "主食",
    "name": "包子"
  },
  {
    "id": 4,
    "type": "主食",
    "name": "饺子"
  },
  {
    "id": 5,
    "type": "主食",
    "name": "馒头"
  },
  {
    "id": 6,
    "type": "主食",
    "name": "炒饭"
  },
  {
    "id": 7,
    "type": "主食",
    "name": "粥"
  },
  {
    "id": 8,
    "type": "主食",
    "name": "花卷"
  },
  {
    "id": 9,
    "type": "主食",
    "name": "炸酱面"
  },
  {
    "id": 10,
    "type": "主食",
    "name": "油条"
  },
  {
    "id": 11,
    "type": "肉菜",
    "name": "红烧肉"
  },
  {
    "id": 12,
    "type": "肉菜",
    "name": "宫保鸡丁"
  },
  {
    "id": 13,
    "type": "肉菜",
    "name": "鱼香肉丝"
  },
  {
    "id": 14,
    "type": "肉菜",
    "name": "清蒸鲈鱼"
  },
  {
    "id": 15,
    "type": "肉菜",
    "name": "麻辣小龙虾"
  },
  {
    "id": 16,
    "type": "肉菜",
    "name": "牛肉炖土豆"
  },
  {
    "id": 17,
    "type": "肉菜",
    "name": "羊肉串"
  },
  {
    "id": 18,
    "type": "肉菜",
    "name": "烤鸭"
  },
  {
    "id": 19,
    "type": "肉菜",
    "name": "炸鸡翅"
  },
  {
    "id": 20,
    "type": "肉菜",
    "name": "卤肉饭"
  },
  {
    "id": 21,
    "type": "素菜",
    "name": "麻辣豆腐"
  },
  {
    "id": 22,
    "type": "素菜",
    "name": "清炒时蔬"
  },
  {
    "id": 23,
    "type": "素菜",
    "name": "蒜蓉西兰花"
  },
  {
    "id": 24,
    "type": "素菜",
    "name": "地三鲜"
  },
  {
    "id": 25,
    "type": "素菜",
    "name": "炒土豆丝"
  },
  {
    "id": 26,
    "type": "素菜",
    "name": "蚝油生菜"
  },
  {
    "id": 27,
    "type": "素菜",
    "name": "凉拌黄瓜"
  },
  {
    "id": 28,
    "type": "素菜",
    "name": "红烧茄子"
  },
  {
    "id": 29,
    "type": "素菜",
    "name": "香菇炒青菜"
  },
  {
    "id": 30,
    "type": "素菜",
    "name": "素炒豆腐"
  },
  {
    "id": 31,
    "type": "水果",
    "name": "苹果"
  },
  {
    "id": 32,
    "type": "水果",
    "name": "香蕉"
  },
  {
    "id": 33,
    "type": "水果",
    "name": "橙子"
  },
  {
    "id": 34,
    "type": "水果",
    "name": "葡萄"
  },
  {
    "id": 35,
    "type": "水果",
    "name": "西瓜"
  },
  {
    "id": 36,
    "type": "水果",
    "name": "草莓"
  },
  {
    "id": 37,
    "type": "水果",
    "name": "蓝莓"
  },
  {
    "id": 38,
    "type": "水果",
    "name": "菠萝"
  },
  {
    "id": 39,
    "type": "水果",
    "name": "芒果"
  },
  {
    "id": 40,
    "type": "水果",
    "name": "猕猴桃"
  }
];

//数据库连接
const db = wx.cloud.database();
const foodCollection = db.collection('foods');

//页面局部变量
Page({

  //数据相关
  data: {

    //表单查询条件数据
    categories: ["主食", "肉菜", "素菜", "水果"], // 下拉框的类别数据
    selectedItem: "", // 选中的类别
    inputName: "", // 文本框输入的名称

    //table数据
    pageData: [], // 当前页的数据
    totalPages: 0, // 总页数
    pageNum: 1, // 当前页

    //模态框数据
    showModal: false, // 是否展示模态框
    modalSelectedItem: "", // 模态框中选择的类别
    modalInputName: "", // 模态框中输入的名称
    isEditing: false, // 是否为编辑模式
    editingItemId: null, // 编辑时的 item ID
  },

  //---------------------------钩子函数相关--------------------------//
  //钩子函数，页面初始化时调用
  onLoad: function () {

    //1.更新当前页数据
    this.updatePageData();
  },

  //---------------------------页面函数相关--------------------------//
  // 更新当前页数据
  async updatePageData() {
    try {

      //1.定义参数
      const {
        selectedItem,
        inputName,
        pageNum
      } = this.data;

      //2.获取分页数据
      const {
        total,
        data
      } = await this.getPageInfo(pageNum, selectedItem, inputName);

      //3.计算总页数
      const totalPages = Math.ceil(total / PAGE_SIZE);

      //4.更新页面数据
      this.setData({
        pageData: data,
        totalPages: totalPages,
      });
    } catch (err) {
      console.error('我滴菜单数据查询失败', err);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
      });
    }
  },

  // 下拉框选中项变化
  onPickerChange: function (e) {

    //1.获取下拉框数据
    const selectedItem = this.data.categories[e.detail.value];

    //2.设置下拉框数据，重置当前页
    this.setData({
      selectedItem: selectedItem,
      pageNum: 1
    });

    //3.更新当前页数据
    this.updatePageData();
  },

  // 文本框输入变化
  onInputChange: function (e) {

    //1.获取文本框数据
    const inputName = e.detail.value;

    //2.设置文本框数据，重置当前页
    this.setData({
      inputName: inputName,
      pageNum: 1
    });

    //3.更新当前页数据
    this.updatePageData();
  },

  // 清空按钮点击
  onRemove: function (e) {

    //1.重置表单数据
    this.setData({
      selectedItem: "",
      inputName: "",
      pageNum: 1
    });

    //2.更新当前页数据
    this.updatePageData();
  },

  // 录入菜单按钮点击
  onAddMenu: function () {

    //1.显示模态框
    this.setData({
      showModal: true,
      isEditing: false,
      modalSelectedItem: "",
      modalInputName: "",
      editingItemId: null,
    })

    //2.TODO 模拟数据库新增数据

    //3.更新当前页数据
    this.updatePageData();
  },

  // 编辑按钮点击事件
  editItem: function (e) {

    //1.获取编辑项
    const id = e.currentTarget.dataset.id;
    const item = this.data.pageData.find(item => item.id === id);

    //2.显示模态框，并回显数据
    this.setData({
      showModal: true,
      isEditing: true,
      modalSelectedItem: item.type,
      modalInputName: item.name,
      editingItemId: id,
    })

    //3.TODO 模拟数据库更新数据

    //4.更新当前页数据
    this.updatePageData();
  },

  // 删除按钮点击事件
  deleteItem: function (e) {

    //1.获取删除项ID
    const id = e.currentTarget.dataset.id;

    //2.显示确认框
    wx.showModal({
      title: '确认删除',
      content: '您确定要删除这条数据吗？',
      success: (res) => {

        //3.如果确认删除
        if (res.confirm) {

          //4.TODO 模拟数据库删除数据

          //5.更新当前页数据
          this.updatePageData();
        }
      }
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

  //---------------------------模态框函数相关--------------------------//
  // 模态框下拉框选择变化
  onPickerChangeModal: function (e) {

    //1.获取模态框下拉框数据
    const selectedItem = this.data.categories[e.detail.value];

    //2.设置数据
    this.setData({
      modalSelectedItem: selectedItem,
    });
  },

  // 模态框文本框输入变化
  onInputChangeModal: function (e) {

    //1.获取模态框文本输入框数据
    const inputName = e.detail.value;

    //2.设置数据
    this.setData({
      modalInputName: inputName,
    });
  },

  // 确认按钮点击事件
  onConfirm: function () {

    //1.获取模态框相关数据
    const {
      isEditing,
      modalSelectedItem,
      modalInputName,
      editingItemId
    } = this.data;

    //2.校验输入数据合法性
    if (!modalSelectedItem || !modalInputName) {
      wx.showToast({
        title: '请选择类别并输入名称',
        icon: 'none',
      });
      return;
    }

    //3.根据不同模式进行不同处理
    if (isEditing) {
      //4.编辑模式，更新数据 TODO 模拟数据库更新数据
    } else {
      //4.录入模式，新增数据 TODO 模拟数据库插入数据
    }

    //5.更新成功，关闭模态框，清空数据
    this.setData({
      showModal: false,
      isEditing: false,
      modalSelectedItem: "",
      modalInputName: "",
      editingItemId: null,
    });

    //6.更新当前页数据
    this.updatePageData();
  },

  // 取消按钮点击事件
  onCancel: function () {

    //1.关闭模态框，清空数据
    this.setData({
      showModal: false,
      isEditing: false,
      modalSelectedItem: "",
      modalInputName: "",
      editingItemId: null,
    });
  },

  //---------------------------数据库函数相关--------------------------//
  // 查询分页数据和总数据数量的函数
  async getPageInfo(pageNum, selectedItem, inputName) {
    try {
      //1.创建查询条件
      let queryCondition = {};

      //2.如果 selectedItem 有值，添加精确匹配条件
      if (selectedItem) {
        queryCondition.type = selectedItem;
      }

      //3.如果 inputName 有值，添加模糊匹配条件
      if (inputName) {
        queryCondition.name = db.RegExp({
          regexp: inputName,
          options: 'i',
        });
      }

      //4.查询总数据数量
      const countRes = await foodCollection.where(queryCondition).count();
      const totalCount = countRes.total;

      //5.查询分页数据
      const pageRes = await foodCollection.where(queryCondition)
        .skip((pageNum - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .get();
      const pageData = pageRes.data;

      //6. 返回结果
      return {
        total: totalCount,
        data: pageData,
      };
    } catch (err) {
      console.error('查询失败', err);
      throw err;
    }
  }
});