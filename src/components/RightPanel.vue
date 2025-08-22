<template>
  <section class="panel history-panel">
    <div class="panel-head">
      <svg class="head-ic" viewBox="0 0 24 24"><path d="..." fill="currentColor"/></svg>
      <h3>信息分类</h3>
    </div>

    <div class="tag-buttons">
      <button class="tag-btn" @click="$router.push('/meeting')">会议</button>
      <button class="tag-btn" @click="$router.push('/life')">生活</button>
      <button class="tag-btn" @click="$router.push('/finance')">财务</button>
    </div>

    <div class="hint">提示：点击标签查看相关记录，或在输入中使用 <code>#标签</code> 自动分类。</div>
  </section>
</template>
