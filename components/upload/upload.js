Page({
    data: {
      inputValue: '', // 输入框内容
      showCategoryModal: false, // 控制弹窗显示
      pendingContent: '', // 待分类的内容（从输入框获取）
      
      // 类别相关
      categoryOptions: ['会议', '生活', '经济', '自定义'], // 类别选项
      selectedCategoryIndex: 0, // 默认选中第一个类别
      customCategory: '', // 自定义类别内容
      
      // 时间相关
      timeValue: '' // 时间值（默认当前时间）
    },
  
    // 监听输入框变化
    onInputChange(e) {
      this.setData({
        inputValue: e.detail.value
      });
    },
  
    // 点击上传按钮，显示分类弹窗
    sendMessage() {
      const content = this.data.inputValue.trim();
      if (!content) return;
  
      // 获取当前时间并格式化（例如：2025-08-16 15:30）
      const now = new Date();
      const formattedTime = `${now.getFullYear()}-${this.padZero(now.getMonth() + 1)}-${this.padZero(now.getDate())} ${this.padZero(now.getHours())}:${this.padZero(now.getMinutes())}`;
  
      // 显示弹窗，同时传递内容和当前时间
      this.setData({
        pendingContent: content,
        timeValue: formattedTime,
        showCategoryModal: true,
        inputValue: '' // 清空输入框
      });
    },
  
    // 选择附件
    chooseAttachment() {
      wx.showActionSheet({
        itemList: ['图片', '视频', '文件'],
        success: (res) => {
          switch(res.tapIndex) {
            case 0:
              this.chooseImage(); // 选择图片
              break;
            case 1:
              this.chooseVideo(); // 选择视频
              break;
            case 2:
              this.chooseFile(); // 选择文件
              break;
          }
        }
      });
    },
  
    // 选择图片
    chooseImage() {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          console.log('选择的图片:', tempFilePaths);
          // 这里可以添加上传图片的逻辑
        }
      });
    },
  
    // 选择视频
    chooseVideo() {
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        camera: 'back',
        success: (res) => {
          console.log('选择的视频:', res.tempFilePath);
          // 这里可以添加上传视频的逻辑
        }
      });
    },
  
    // 选择文件
    chooseFile() {
      wx.chooseMessageFile({
        count: 1,
        type: 'all',
        success: (res) => {
          const tempFilePath = res.tempFiles[0].path;
          console.log('选择的文件:', tempFilePath);
          // 这里可以添加上传文件的逻辑
        }
      });
    },
      
    // 选择类别变化时触发
    onCategoryChange(e) {
        this.setData({
        selectedCategoryIndex: e.detail.value,
        customCategory: '' // 切换类别时清空自定义输入
        });
    },
      
    // 自定义类别输入变化
    onCustomCategoryChange(e) {
        this.setData({
        customCategory: e.detail.value
        });
    },
      
    // 时间输入变化
    onTimeChange(e) {
        this.setData({
            timeValue: e.detail.value
        });
    },
      
    // 确认分类
    confirmCategory() {
        // 获取最终类别（如果是自定义，取输入值；否则取选项值）
        let finalCategory;
        if (this.data.categoryOptions[this.data.selectedCategoryIndex] === '自定义') {
            finalCategory = this.data.customCategory.trim() || '未命名'; // 自定义类别不能为空
        } else {
            finalCategory = this.data.categoryOptions[this.data.selectedCategoryIndex];
        }
      
        // 获取时间（确保不为空）
        const finalTime = this.data.timeValue.trim() || new Date().toLocaleString();
      
        // 整合分类结果
        const result = {
            category: finalCategory,
            content: this.data.pendingContent,
            time: finalTime
        };

        // 将数据转为 JSON 字符串（因为 url 参数只能传字符串）
        const recordStr = encodeURIComponent(JSON.stringify(result));

        // 【新增】保存到本地存储（关键：确保数据持久化）
        const historyRecords = wx.getStorageSync('historyRecords') || [];
        historyRecords.unshift(result); // 新记录插入到数组开头
        wx.setStorageSync('historyRecords', historyRecords);
        console.log('本地存储的历史记录：', historyRecords); // 打印确认

        // 跳转到历史记录页面并携带参数
        wx.navigateTo({
          url: `../database/database?record=${recordStr}`
        });

        // 处理结果（例如上传到服务器或本地存储）
        console.log('分类完成：', result);
          wx.showToast({
          title: '上传成功'
        });
      
        // 关闭弹窗
        this.setData({
            showCategoryModal: false
        });
        },
      
        // 取消分类
        cancelCategory() {
          this.setData({
            showCategoryModal: false,
            customCategory: '' // 重置自定义类别
          });
        },
      
        // 数字补零（例如 9 → 09）
        padZero(n) {
          return n < 10 ? `0${n}` : n;
        }
});