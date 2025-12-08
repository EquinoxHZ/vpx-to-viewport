import './styles.css';

// 显示当前视口宽度
function updateViewportInfo() {
  const width = window.innerWidth;
  const widthElement = document.getElementById('viewport-width');
  const deviceElement = document.getElementById('device-type');

  if (widthElement) {
    widthElement.textContent = `${width}px`;
  }

  if (deviceElement) {
    let deviceType = 'Mobile';
    if (width >= 1200) {
      deviceType = 'Desktop (Large)';
    } else if (width >= 768) {
      deviceType = 'Tablet / Desktop (Small)';
    }
    deviceElement.textContent = deviceType;
  }
}

// 页面加载时更新
window.addEventListener('load', updateViewportInfo);
// 窗口大小改变时更新
window.addEventListener('resize', updateViewportInfo);

// 添加交互效果
document.addEventListener('DOMContentLoaded', () => {
  const boxes = document.querySelectorAll('.box');

  boxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
      box.style.transform = 'scale(1.05)';
    });

    box.addEventListener('mouseleave', () => {
      box.style.transform = 'scale(1)';
    });
  });
});

console.log('Webpack Loader VPX 示例已加载！');
console.log('调整浏览器窗口大小查看响应式效果');
