// index.js
// const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    showModal: 0,
    imagePath: ''
  },
  showUploadModal() {
    this.setData({ showModal: 1 });
  },
  closeModal() {
    this.setData({ showModal: 0, imagePath: '' });
  },
  switchModal(){
    this.setData({ showModal: -this.data.showModal, imagePath: '' });
  },
  chooseImage() {
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log('选择图片路径:', res.tempFilePaths[0]);
        this.setData({ imagePath: res.tempFilePaths[0] });
      }
    });
  },
  uploadImage() {
    // 这里只做前端演示，实际上传接口不用写
    wx.showToast({
      title: '已上传',
      icon: 'success'
    });
    this.closeModal();
  },
  goToDatabase() {
    wx.navigateTo({
      url: '/pages/database/database'
    });
  }
});
