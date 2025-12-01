import { createVNode, render } from 'vue';
let componentList = {};
export const showDialog = async (component, props = {}, emits = {}) => {
    let name = component.__name || component.name;
    if (componentList[name]) {
        document.body.removeChild(componentList[name]);
    }
    const container = document.createElement('div');
    const vNode = createVNode(component, {
        visible: true,
        onClosed: () => {
            delete componentList[name];
            document.body.removeChild(container);
        },
        ...props,
        ...emits,
    });
    render(vNode, container);
    componentList[name] = container;
    document.body.appendChild(container);
};

export const clearAllDialog = async () => {
    Object.keys(componentList).forEach((key) => {
        document.body.removeChild(componentList[key]);
        delete componentList[key];
    });
};

export const closeDialog = async (name) => {
    if (componentList[name]) {
        document.body.removeChild(componentList[name]);
        delete componentList[name];
    }
};

export const pxToRem = (pxValue) => {
    // 获取根元素的字体大小
    var rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
    // 将根字体大小从字符串转换为数字
    rootFontSize = parseFloat(rootFontSize);
    pxValue = parseFloat(pxValue);
    // 计算rem值并返回
    return pxValue / rootFontSize + 'rem';
};
export const remToPx = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};
export const roundingNumber = (num, decimal = 2, isRounding) => {
    return isRounding ? num.toFixed(decimal) : Math.floor(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
};
export const format = (text, isRounding = true) => {
    if (text === null) {
        return 'NULL';
    }
    const number = parseFloat(text);
    if (Number.isNaN(number)) {
        return text;
    }

    if (Number.isInteger(number)) {
        return text;
    }

    if (number > 1) {
        return roundingNumber(number, 1, isRounding);
    }
    if (number > 0.1) {
        return roundingNumber(number, 2, isRounding);
    }
    if (number > 0.01) {
        return roundingNumber(number, 3, isRounding);
    }
    if (number > 0.001) {
        return roundingNumber(number, 4, isRounding);
    }
    if (number > 0.0001) {
        return roundingNumber(number, 5, isRounding);
    }
    if (number > 0.00001) {
        return roundingNumber(number, 6, isRounding);
    }
    return roundingNumber(number, 7, isRounding);
};
export const roundTo = (num) => {
    if (typeof num !== 'number') {
        return num;
    }
    let numStr = num.toString();
    const [integerPart, decimalPart] = numStr.split('.');
    // 去除整数部分的负号
    const cleanedInteger = integerPart.replace('-', '');
    const index = cleanedInteger.length;
    let step = Math.pow(10, index - 1);
    if (num > 1) {
        return Math.round(num / step) * step;
    } else {
        return Math.round(num * 10) / 10;
    }
};
