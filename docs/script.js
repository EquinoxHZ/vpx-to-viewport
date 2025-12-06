// 配置对象
let config = {
  viewportWidth: 768,
  baseViewport: 768,
  testValue: 300,
  maxRatio: 1.2, // 最小不会小于 100 * 1.2 = 120px
  minRatio: 0.8, // 最大不会超过 100 * 0.8 = 80px
  clampMinRatio: 0.7, // 范围限制：70px 到 150px
  clampMaxRatio: 1.5,
  linearMinVal: 200,
  linearMaxVal: 450,
  linearMinWidth: 768,
  linearMaxWidth: 1440,
};

// 计算函数
function calculateVpx(vpx, viewportWidth, baseViewport) {
  const vw = (vpx / baseViewport) * 100;
  const pixels = (vw / 100) * viewportWidth;
  return { vw, pixels };
}

function calculateMaxVpx(vpx, viewportWidth, baseViewport, maxRatio) {
  const { vw, pixels: vwPixels } = calculateVpx(vpx, viewportWidth, baseViewport);
  const minBound = vpx * maxRatio;
  const actualPixels = Math.max(vwPixels, minBound);
  return { vw, minBound, actualPixels, formula: `max(${vw.toFixed(2)}vw, ${minBound}px)` };
}

function calculateMinVpx(vpx, viewportWidth, baseViewport, minRatio) {
  const { vw, pixels: vwPixels } = calculateVpx(vpx, viewportWidth, baseViewport);
  const maxBound = vpx * minRatio;
  const actualPixels = Math.min(vwPixels, maxBound);
  return { vw, maxBound, actualPixels, formula: `min(${vw.toFixed(2)}vw, ${maxBound}px)` };
}

function calculateCvpx(vpx, viewportWidth, baseViewport, clampMinRatio, clampMaxRatio) {
  const { vw, pixels: vwPixels } = calculateVpx(vpx, viewportWidth, baseViewport);
  const minBound = vpx * clampMinRatio;
  const maxBound = vpx * clampMaxRatio;
  const actualPixels = Math.max(minBound, Math.min(vwPixels, maxBound));
  return {
    vw,
    minBound,
    maxBound,
    actualPixels,
    formula: `clamp(${minBound}px, ${vw.toFixed(2)}vw, ${maxBound}px)`,
  };
}

function calculateLinearVpx(minVal, maxVal, minWidth, maxWidth, viewportWidth) {
  const valueDiff = maxVal - minVal;
  const widthDiff = maxWidth - minWidth;

  let actualPixels;
  if (viewportWidth <= minWidth) {
    actualPixels = minVal;
  } else if (viewportWidth >= maxWidth) {
    actualPixels = maxVal;
  } else {
    actualPixels = minVal + (valueDiff * (viewportWidth - minWidth)) / widthDiff;
  }

  const calcExpr = `calc(${minVal}px + ${valueDiff} * (100vw - ${minWidth}px) / ${widthDiff})`;
  const formula = `clamp(${minVal}px, ${calcExpr}, ${maxVal}px)`;

  return { actualPixels, formula, minVal, maxVal };
}

// 更新设备框架显示
function updateDeviceDisplay(updateChart = true) {
  const {
    viewportWidth,
    baseViewport,
    testValue,
    maxRatio,
    minRatio,
    clampMinRatio,
    clampMaxRatio,
  } = config;
  const { linearMinVal, linearMaxVal, linearMinWidth, linearMaxWidth } = config;

  // 更新设备宽度
  document.getElementById('current-viewport-display').textContent = `${viewportWidth}px`;

  // 计算各单位的值
  const vpxResult = calculateVpx(testValue, viewportWidth, baseViewport);
  const maxvpxResult = calculateMaxVpx(testValue, viewportWidth, baseViewport, maxRatio);
  const minvpxResult = calculateMinVpx(testValue, viewportWidth, baseViewport, minRatio);
  const cvpxResult = calculateCvpx(
    testValue,
    viewportWidth,
    baseViewport,
    clampMinRatio,
    clampMaxRatio
  );
  const linearVpxResult = calculateLinearVpx(
    linearMinVal,
    linearMaxVal,
    linearMinWidth,
    linearMaxWidth,
    viewportWidth
  );

  // 更新 vpx
  updateUnitDisplay(
    'vpx',
    vpxResult.pixels,
    `${testValue}vpx → ${vpxResult.vw.toFixed(2)}vw`,
    `${vpxResult.pixels.toFixed(1)}px`
  );

  // 更新 maxvpx
  updateUnitDisplay(
    'maxvpx',
    maxvpxResult.actualPixels,
    maxvpxResult.formula,
    `${maxvpxResult.actualPixels.toFixed(1)}px (min: ${maxvpxResult.minBound}px)`
  );

  // 更新 minvpx
  updateUnitDisplay(
    'minvpx',
    minvpxResult.actualPixels,
    minvpxResult.formula,
    `${minvpxResult.actualPixels.toFixed(1)}px (max: ${minvpxResult.maxBound}px)`
  );

  // 更新 cvpx
  updateUnitDisplay(
    'cvpx',
    cvpxResult.actualPixels,
    cvpxResult.formula,
    `${cvpxResult.actualPixels.toFixed(1)}px`
  );

  // 更新 linear-vpx
  updateUnitDisplay(
    'linear-vpx',
    linearVpxResult.actualPixels,
    linearVpxResult.formula,
    `${linearVpxResult.actualPixels.toFixed(1)}px`
  );

  // 更新 linear-vpx 的 badge 显示（显示原始语法）
  document.getElementById('linear-vpx-badge').textContent =
    `width: linear-vpx(${linearMinVal}, ${linearMaxVal}, ${linearMinWidth}, ${linearMaxWidth});`;

  // 更新 linear-vpx 的语义提示
  document.getElementById('hint-min-width').textContent = config.linearMinWidth;
  document.getElementById('hint-min-val').textContent = config.linearMinVal;
  document.getElementById('hint-max-width').textContent = config.linearMaxWidth;
  document.getElementById('hint-max-val').textContent = config.linearMaxVal;

  // 拖动时不更新图表，只在参数变化时更新
  if (updateChart) {
    updateChartDisplay();
  }
}

function updateUnitDisplay(unit, pixels, formula, sizeText) {
    const box = document.getElementById(`${unit}-display-box`);
    const label = document.getElementById(`${unit}-box-label`);
    const formulaEl = document.getElementById(`${unit}-formula`);
    const sizeEl = document.getElementById(`${unit}-size`);
    const inputValueEl = document.getElementById(`${unit}-input-value`);

    // 直接用实际像素值作为条形宽度，保持一致
    const barWidth = pixels;

    // 通过 CSS 变量控制进度条宽度（以 px 为单位）
    box.style.setProperty('--bar-width', `${barWidth}px`);

    label.textContent = `${pixels.toFixed(1)}px`;
    formulaEl.textContent = formula;
    sizeEl.textContent = sizeText;

    // 更新标题中的输入值
    if (inputValueEl) {
        inputValueEl.textContent = config.testValue;
    }

    // 检测条形是否超出容器，显示超出指示器
    // 等待设备框架的 transition 完成（0.3s）后再检测
    const checkOverflow = () => {
        const containerWidth = box.offsetWidth;
        const isOverflow = barWidth > containerWidth;
        box.style.setProperty('--overflow', isOverflow ? '1' : '0');
    };

    setTimeout(checkOverflow, 350);
}// 拖动调整设备宽度
function initResizeHandle() {
  const resizeHandle = document.getElementById('resize-handle');
  const deviceFrame = document.getElementById('device-frame');
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  let rafId = null;
  let lastUpdateWidth = 0;

  resizeHandle.addEventListener('mousedown', e => {
    isResizing = true;
    startX = e.clientX;
    startWidth = deviceFrame.offsetWidth;
    lastUpdateWidth = startWidth;
    document.body.style.cursor = 'ew-resize';

    // 拖动时移除过渡，使拖动跟手
    deviceFrame.style.transition = 'none';

    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    let newWidth = startWidth + deltaX;

    // 限制宽度范围
    newWidth = Math.max(320, Math.min(1920, newWidth));

    deviceFrame.style.width = `${newWidth}px`;
    config.viewportWidth = newWidth;

    // 只有当宽度变化超过 2px 时才触发更新，减少更新频率
    if (Math.abs(newWidth - lastUpdateWidth) >= 2) {
      lastUpdateWidth = newWidth;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateDeviceDisplay(false); // 拖动时不更新图表
      });
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';

      // 恢复过渡
      deviceFrame.style.transition = 'width 0.3s ease';

      if (rafId) cancelAnimationFrame(rafId);
      // 拖动完成后进行最终更新
      updateDeviceDisplay(true);
    }
  });
}

// 全局图表实例
let chartInstance = null;
let hoveredDatasetIndex = -1;

// 根据页面语言获取文本
const isEnglish = document.documentElement.lang === 'en';
const i18n = {
  viewportWidth: isEnglish ? 'Viewport Width' : '视口宽度',
  pixelValue: isEnglish ? 'Pixel Value' : '像素值',
};

// 绘制图表 - 使用 Chart.js
function updateChartDisplay() {
  const canvas = document.getElementById('comparison-chart');
  if (!canvas) return;

  const { testValue, maxRatio, baseViewport, minRatio, clampMinRatio, clampMaxRatio, viewportWidth } = config;

  // 生成视口宽度数据点 (320-1920px)
  const viewports = [];
  for (let i = 0; i <= 100; i++) {
    viewports.push(320 + (1920 - 320) * (i / 100));
  }

  // 曲线数据
  const vpxData = viewports.map(vw => calculateVpx(testValue, vw, baseViewport).pixels);
  const maxvpxData = viewports.map(vw => calculateMaxVpx(testValue, vw, baseViewport, maxRatio).actualPixels);
  const minvpxData = viewports.map(vw => calculateMinVpx(testValue, vw, baseViewport, minRatio).actualPixels);
  const cvpxData = viewports.map(vw => calculateCvpx(testValue, vw, baseViewport, clampMinRatio, clampMaxRatio).actualPixels);
  const linearVpxData = viewports.map(vw => calculateLinearVpx(config.linearMinVal, config.linearMaxVal, config.linearMinWidth, config.linearMaxWidth, vw).actualPixels);

  const datasets = [
    {
      label: 'vpx',
      data: vpxData,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#3b82f6',
    },
    {
      label: 'maxvpx',
      data: maxvpxData,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#10b981',
    },
    {
      label: 'minvpx',
      data: minvpxData,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.05)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#f59e0b',
    },
    {
      label: 'cvpx',
      data: cvpxData,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ef4444',
    },
    {
      label: 'linear-vpx',
      data: linearVpxData,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.05)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#8b5cf6',
    },
  ];

  const chartConfig = {
    type: 'line',
    data: {
      labels: viewports.map(v => Math.round(v)),
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      onHover: (event, activeElements) => {
        if (activeElements && activeElements.length > 0) {
          hoveredDatasetIndex = activeElements[0].datasetIndex;
        } else {
          hoveredDatasetIndex = -1;
        }
        updateChartDatasetStyles();
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#475569',
            font: { size: 12 },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            title: function(context) {
              return `${i18n.viewportWidth}: ${Math.round(context[0].label)}px`;
            },
            label: function(context) {
              const value = Math.round(context.parsed.y);
              return `${context.dataset.label}: ${value}px`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: `${i18n.viewportWidth} (px)`,
            color: '#64748b',
            font: { size: 12, weight: 'bold' },
          },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            maxTicksLimit: 6,
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.5)',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: `${i18n.pixelValue} (px)`,
            color: '#64748b',
            font: { size: 12, weight: 'bold' },
          },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.5)',
          },
        },
      },
    },
    plugins: [
      {
        id: 'currentViewportLine',
        afterDatasetsDraw(chart) {
          const { ctx, chartArea } = chart;
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;

          // 计算当前视口宽度对应的 x 坐标
          const xPixel = xScale.getPixelForValue(viewportWidth);

          if (xPixel >= chartArea.left && xPixel <= chartArea.right) {
            ctx.save();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(xPixel, chartArea.top);
            ctx.lineTo(xPixel, chartArea.bottom);
            ctx.stroke();
            ctx.restore();
          }
        },
      },
    ],
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, chartConfig);

  // 添加鼠标移出事件处理
  canvas.addEventListener('mouseout', () => {
    hoveredDatasetIndex = -1;
    updateChartDatasetStyles();
  });
}

// 原始颜色映射
const originalColors = {
  'vpx': '#3b82f6',
  'maxvpx': '#10b981',
  'minvpx': '#f59e0b',
  'cvpx': '#ef4444',
  'linear-vpx': '#8b5cf6'
};

// 辅助函数：将 hex 颜色转换为 rgba
function hexToRgba(hex, alpha) {
  // 确保 hex 是字符串且以 # 开头
  if (typeof hex !== 'string' || !hex.startsWith('#')) {
    return hex;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 更新数据集样式以实现高亮效果
function updateChartDatasetStyles() {
  if (!chartInstance) return;

  chartInstance.data.datasets.forEach((dataset, index) => {
    const originalColor = originalColors[dataset.label];

    if (hoveredDatasetIndex === -1) {
      // 没有高亮 - 恢复正常，所有线都亮
      dataset.borderWidth = 2.5;
      dataset.borderColor = originalColor;
      dataset.pointRadius = 0;
      dataset.pointHoverRadius = 6;
    } else if (index === hoveredDatasetIndex) {
      // 高亮该数据集 - 保持宽度，但颜色完全不透明+更亮
      dataset.borderWidth = 2.5;
      dataset.borderColor = originalColor;  // 保持原色但完全不透明
      dataset.pointRadius = 0;
      dataset.pointHoverRadius = 0;
    } else {
      // 淡化其他数据集 - 大幅降低不透明度到0.1
      dataset.borderWidth = 2.5;
      dataset.borderColor = hexToRgba(originalColor, 0.1);
      dataset.pointRadius = 0;
      dataset.pointHoverRadius = 0;
    }
  });

  chartInstance.update(false);
}

// 初始化事件监听
function initEventListeners() {
  // 设备预设按钮
  document.querySelectorAll('.device-preset-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const width = parseInt(e.target.dataset.width);
      config.viewportWidth = width;
      document.getElementById('device-frame').style.width = `${width}px`;

      // 更新活动状态
      document.querySelectorAll('.device-preset-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // 立即调用，让 setTimeout(0) 在更改完所有 DOM 后执行
      updateDeviceDisplay();
    });
  });

  // 基准视口
  const baseViewportInput = document.getElementById('base-viewport');
  const baseValueSpan = document.getElementById('base-value');
  baseViewportInput.addEventListener('input', e => {
    config.baseViewport = parseInt(e.target.value);
    baseValueSpan.textContent = e.target.value;
    updateDeviceDisplay();
  });

  // 测试值
  const testValueInput = document.getElementById('test-value');
  const testValueSpan = document.getElementById('test-value-display');
  testValueInput.addEventListener('input', e => {
    config.testValue = parseInt(e.target.value);
    testValueSpan.textContent = e.target.value;
    updateDeviceDisplay();
  });

  // maxRatio
  const maxRatioInput = document.getElementById('max-ratio');
  const maxRatioSpan = document.getElementById('max-ratio-value');
  maxRatioInput.addEventListener('input', e => {
    config.maxRatio = parseFloat(e.target.value);
    maxRatioSpan.textContent = parseFloat(e.target.value).toFixed(1);
    updateDeviceDisplay();
  });

  // minRatio
  const minRatioInput = document.getElementById('min-ratio');
  const minRatioSpan = document.getElementById('min-ratio-value');
  minRatioInput.addEventListener('input', e => {
    config.minRatio = parseFloat(e.target.value);
    minRatioSpan.textContent = parseFloat(e.target.value).toFixed(1);
    updateDeviceDisplay();
  });

  // clampMinRatio
  const clampMinRatioInput = document.getElementById('clamp-min-ratio');
  const clampMinRatioSpan = document.getElementById('clamp-min-ratio-value');
  clampMinRatioInput.addEventListener('input', e => {
    config.clampMinRatio = parseFloat(e.target.value);
    clampMinRatioSpan.textContent = parseFloat(e.target.value).toFixed(1);
    updateDeviceDisplay();
  });

  // clampMaxRatio
  const clampMaxRatioInput = document.getElementById('clamp-max-ratio');
  const clampMaxRatioSpan = document.getElementById('clamp-max-ratio-value');
  clampMaxRatioInput.addEventListener('input', e => {
    config.clampMaxRatio = parseFloat(e.target.value);
    clampMaxRatioSpan.textContent = parseFloat(e.target.value).toFixed(1);
    updateDeviceDisplay();
  });

  // linear-vpx 最小值
  const linearMinValInput = document.getElementById('linear-min-val');
  const linearMinValSpan = document.getElementById('linear-min-value');
  linearMinValInput.addEventListener('input', e => {
    config.linearMinVal = parseInt(e.target.value);
    linearMinValSpan.textContent = e.target.value;
    updateDeviceDisplay();
  });

  // linear-vpx 最大值
  const linearMaxValInput = document.getElementById('linear-max-val');
  const linearMaxValSpan = document.getElementById('linear-max-value');
  linearMaxValInput.addEventListener('input', e => {
    config.linearMaxVal = parseInt(e.target.value);
    linearMaxValSpan.textContent = e.target.value;
    updateDeviceDisplay();
  });

  // linear-vpx 最小视口
  const linearMinWidthInput = document.getElementById('linear-min-width');
  const linearMinWidthSpan = document.getElementById('linear-min-width-value');
  linearMinWidthInput.addEventListener('input', e => {
    config.linearMinWidth = parseInt(e.target.value);
    linearMinWidthSpan.textContent = e.target.value;
    updateDeviceDisplay();
  });

  // linear-vpx 最大视口
  const linearMaxWidthInput = document.getElementById('linear-max-width');
  const linearMaxWidthSpan = document.getElementById('linear-max-width-value');
  linearMaxWidthInput.addEventListener('input', e => {
    config.linearMaxWidth = parseInt(e.target.value);
    linearMaxWidthSpan.textContent = e.target.value;
    updateDeviceDisplay();
  });

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', () => {
    updateChartDisplay();
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initResizeHandle();
  updateDeviceDisplay();
});
