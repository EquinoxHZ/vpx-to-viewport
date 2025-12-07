// 显示当前视口信息
function updateViewportInfo() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  console.log(`%c当前视口信息`, 'color: #3498db; font-size: 16px; font-weight: bold;');
  console.log(`宽度: ${width}px`);
  console.log(`高度: ${height}px`);
  
  // 显示当前激活的媒体查询配置
  if (width >= 1920) {
    console.log(`%c激活配置: 大屏 (1920px+)`, 'color: #2ecc71; font-weight: bold;');
    console.log('viewportWidth: 1920');
  } else if (width >= 768) {
    console.log(`%c激活配置: 平板 (768px+)`, 'color: #f39c12; font-weight: bold;');
    console.log('viewportWidth: 768');
  } else {
    console.log(`%c激活配置: 移动端 (默认)`, 'color: #e74c3c; font-weight: bold;');
    console.log('viewportWidth: 375');
  }
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
  console.log('%c🎉 Vite Plugin VPX 示例已加载', 'color: #8e44ad; font-size: 20px; font-weight: bold;');
  console.log('%c查看元素的计算样式，了解 vpx 单位的转换结果', 'color: #34495e; font-size: 14px;');
  
  updateViewportInfo();
  
  // 监听窗口大小变化
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateViewportInfo();
    }, 500);
  });
  
  // 添加交互提示
  const demoBoxes = document.querySelectorAll('.demo-box');
  demoBoxes.forEach((box, index) => {
    box.addEventListener('click', () => {
      const boxElement = box.querySelector('.box');
      if (boxElement) {
        const styles = window.getComputedStyle(boxElement);
        console.log(`%c${box.querySelector('h3').textContent}`, 'color: #3498db; font-size: 14px; font-weight: bold;');
        console.log(`宽度: ${styles.width}`);
        console.log(`高度: ${styles.height}`);
      }
    });
  });
});

// 添加性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log(`%c⚡ 页面加载性能`, 'color: #16a085; font-size: 16px; font-weight: bold;');
  console.log(`DOM 解析: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
  console.log(`总加载时间: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
});

export {};
