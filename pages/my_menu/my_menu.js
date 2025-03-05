//固定常量
const PAGE_SIZE = 5;

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
  },

  // 编辑按钮点击事件
  editItem: function (e) {

    //1.获取编辑项
    const id = e.currentTarget.dataset.id;
    const item = this.data.pageData.find(item => item._id === id);

    //2.显示模态框，并回显数据
    this.setData({
      showModal: true,
      isEditing: true,
      modalSelectedItem: item.type,
      modalInputName: item.name,
      editingItemId: item._id,
    })
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

          //4.数据库删除数据
          this.removeFoodItem(id);

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
      this.updateFoodItem(editingItemId, modalInputName, modalSelectedItem)
    } else {
      this.addFoodItem(modalInputName, modalSelectedItem)
    }

    //4.更新成功，关闭模态框，清空数据
    this.setData({
      showModal: false,
      isEditing: false,
      modalSelectedItem: "",
      modalInputName: "",
      editingItemId: null,
    });

    //5.更新当前页数据
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

  //---------------------------数据库函数相关------------------------//
  // 查询分页数据和总数据数量的函数
  async getPageInfo(pageNum, selectedItem, inputName) {
    try {

      //1.创建查询条件
      let queryCondition = {};
      queryCondition._openid = wx.getStorageSync('openId')

      //2.如果 selectedItem 有值，添加精确匹配条件
      if (selectedItem) {
        queryCondition.type = selectedItem;
      }

      //3.如果 inputName 有值，添加模糊匹配条件
      if (inputName) {
        queryCondition.name = db.RegExp({
          regexp: inputName,
          options: '',
        });
      }

      //4.查询总数据数量
      const countRes = await foodCollection.where(queryCondition).count();
      const totalCount = countRes.total;

      //5.查询分页数据
      const pageRes = await foodCollection.where(queryCondition)
        .orderBy('updateTime', 'desc')
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
  },

  //添加菜单项
  async addFoodItem(name, type) {
    try {

      // 1.插入数据
      const res = await foodCollection.add({
        data: {
          name: name,
          type: type,
          updateTime: new Date(),
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

  //修改菜单项
  async updateFoodItem(id, name, type) {
    try {

      // 1.修改数据
      const res = await foodCollection.doc(id).update({
        data: {
          name: name,
          type: type,
          updateTime: new Date(),
        },
      });

      // 2.返回插入结果
      console.log('更新成功', res);
      return res;
    } catch (err) {
      console.error('更新失败', err);
      throw err;
    }
  },

  //删除菜单项
  async removeFoodItem(id) {
    try {

      // 1.修改数据
      const res = await foodCollection.doc(id).remove();

      // 2.返回插入结果
      console.log('删除成功', res);
      return res;
    } catch (err) {
      console.error('删除失败', err);
      throw err;
    }
  }
});