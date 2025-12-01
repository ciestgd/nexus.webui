function getColorByIndex(index, step) {
    // 将色相范围从 240 到 0 平均分成 step 份
    const hue = index * (240 / step);
    // 将 HSL 颜色值转换为 RGB 颜色值
    const rgb = hslToRgb(hue, 1, 0.5);
    // 将 RGB 颜色值转换为十六进制颜色值
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    return hex;
}
// 将 HSL 颜色值转换为 RGB 颜色值
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; 
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;  
        const p = 2 * l - q; 
        r = hue2rgb(p, q, h / 360 + 1 / 3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, h / 360 - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
// 将 RGB 颜色值转换为十六进制颜色值
function rgbToHex(r, g, b) {
    return (
        '#' +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('')
    );
}
export const getColorList = (step) => {
    let colors = [];
    for (let i = 0; i < step; i++) {
        colors.push(getColorByIndex(i, step));
    }
    return colors;
};
