Page({
  data: {
    visible: false,
    placement: 'left',
    sidebar: [],
    iconSidebar: [
      { title: '信息管理', icon: 'folder-open' },
      { title: '个人中心', icon: 'user-1' },
      { title: '菜单三', icon: 'app' }
    ],
    btnOpen: false
  },
  openDrawerIcon() {
    this.setData({
      visible: true,
      sidebar: this.data.iconSidebar,
      btnOpen: true
    });
  },
  overlayClick(e) {
    this.setData({ visible: false, btnOpen: false });
  },
  itemClick(e) {
    console.log(e.detail);
  }
});