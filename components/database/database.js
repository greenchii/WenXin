const image = 'https://tdesign.gtimg.com/mobile/demos/example2.png';
const items = new Array(12).fill({ label: '标题文字', image }, 0, 12);
Page({
  offsetTopList: [],
  data: {
    display: 0,
    sideBarIndex: 1,
    scrollTop: 0,
    categories: [
      {
        label: '会议',
        title: '',
        badgeProps: {},
        items,
      },
      {
        label: '生活',
        title: '',
        badgeProps: {},
        items: items.slice(0, 10),
      },
      {
        label: '经济',
        title: '',
        badgeProps: {},
        items: items.slice(0, 6),
      },
      {
        label: '选项四',
        title: '标题四',
        badgeProps: {},
        items: items.slice(0, 8),
      }
    ],
    navbarHeight: 0,
    //mock信息
    info : [{
    _id: '123',//每个ID
    title: '标题',
    category: '会议',
    content: '内容',
    timestamp: '2023-01-01',
    frommessage: '消息/图片ID',

  },
  {
    _id: '456',//每个ID
    title: '标题',
    category: '生活',
    content: '内容',
    timestamp: '2023-01-01',
    frommessage: '消息/图片ID',
  },
  {
    _id: '789',//每个ID
    title: '标题',
    category: '经济',
    content: '内容',
    timestamp: '2023-01-01',
    frommessage: '消息/图片ID',
  }]
    },
  onLoad() {
    this.getCustomNavbarHeight();
  },

  getCustomNavbarHeight() {
    const query = wx.createSelectorQuery();
    query.select('.custom-navbar').boundingClientRect();
    query.exec((res) => {
      const { height = 0 } = res[0] || {};
      this.setData({ navbarHeight: height });
    });
  },

  onSideBarChange(e) {
    const { value } = e.detail;
    this.setData({ sideBarIndex: value, scrollTop: 0 });
  },
  enterPage(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      display: 1,
      currentInfo: item
    });
  },
  handleBack(){
    this.setData({
      display: 0
    });
  }
});