<template>
    <div class="loading-dots" aria-hidden="true" role="img" title="加载中">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .loading-dots {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    min-width: 40px;
    justify-content: center;
  }
  .loading-dots .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.25;
    transform: translateY(0);
    animation: ld 1s infinite ease-in-out;
  }
  .loading-dots .dot:nth-child(2) { animation-delay: 0.12s; }
  .loading-dots .dot:nth-child(3) { animation-delay: 0.24s; }
  
  @keyframes ld {
    0% { opacity: 0.25; transform: translateY(0); }
    25% { opacity: 1; transform: translateY(-4px); }
    50% { opacity: 0.25; transform: translateY(0); }
    100% { opacity: 0.25; transform: translateY(0); }
  }
  </style>
  