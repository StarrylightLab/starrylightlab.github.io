const display = document.getElementById('display');
org_size = window.getComputedStyle(display).fontSize;
let currentValue = '';
let expression = '';
let isNewNumber = true;
let lastOperator = null;
let lastOperand = null;
// 修改数字输入处理
function handleNumber(num) {
    // 输入新数字时重置连续运算状态
    if (isNewNumber) {
        // lastOperator = null;
        // lastOperand = null;
        currentValue = '';
        isNewNumber = false;
    }

    // 防止以0开头输入多个0
    if (currentValue === '0' && num === '0') return;
    currentValue += num;
    // 格式化显示（移除前导零）
    display.value = formatDisplay(currentValue);
    console.log('数字当前状态:', {
        expression,
        currentValue,
        lastOperator,
        lastOperand,
        isNewNumber
    });
}
// 新增显示格式化函数
// 增强的formatDisplay函数（处理科学计数法）
function formatDisplay(value) {
    // if (value.endsWith('.')) return value;
    // const number = parseFloat(value);

    // 处理极大/极小数
    if (Math.abs(number) >= 1e21 || (number !== 0 && Math.abs(number) < 1e-6)) {
        return number.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return isNaN(number) ? '' : number.toString();


}

// 增强的错误提示（带振动反馈）
function showError() {
    display.value = '错误';
    navigator.vibrate?.(100); // 手机设备会有振动反馈
}

function addZero(expr){
    // 拆分操作数和运算符
    const parts = expr.split(/([+\-×÷])/).filter(p => p);
    let sanitized = '';

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (/^[+\-×÷]$/.test(part)) {
            // 运算符直接保留
            sanitized += part;
        } else {
            // 补全不完整的小数
            let num = part;
            if (num.startsWith('.')) num = '0' + num;    // .3 → 0.3
            if (num.endsWith('.')) num += '0';           // 3. → 3.0
            sanitized += num;
        }
    }
    return sanitized;
}
function sanitizeExpression(expr) {

    //  // 表达式必须包含至少一个运算符和两个操作数
    // if (expression) {
    //     const operators = expression.match(/[+\-×÷]/g);
    //     const operands = expression.split(/[+\-×÷]/).filter(Boolean);
    //     return operators && operators.length >= 1 && operands.length >= 1;
    // }

    // if(expr){
    //     const operators = expr.match(/[+\-×÷]/g);
    //     const operands = expr.split(/[+\-×÷]/).filter(Boolean);
    //     if (operators.length >2){}
    // }

    

    return expr.replace(/[+\-×÷]+$/, '');
}
function safeEval(expr) {
    // 移除表达式中的分号（预防性处理）
    const sanitizedExpr = expr.replace(/;/g, '');

    // 改进后的正则替换
    const converted = sanitizedExpr
        // 匹配数值（包括负数、小数、科学计数法）
        .replace(/(-?\d+\.?\d*|\.\d+)(e[+-]?\d+)?/g, num => `new Decimal(${num})`)
        // 处理运算符（注意空格避免错误替换负号）
        .replace(/(\s*)\+(\s*)/g, '.plus(')
        .replace(/(\s*)-(\s*)/g, (match, p1, p2) => {
            // 如果前面是数字或右括号，则替换为 .minus(
            if (/[\d)]/.test(p1)) {
                return '.minus(';
            }
            // 否则保留负号（表示负数）
            return match;
        })
        .replace(/(\s*)\*(\s*)/g, '.times(')
        .replace(/(\s*)\/(\s*)/g, '.dividedBy(')
        // 自动闭合括号（统计开括号数量并补充闭括号）
        .replace(/^/, '(')  // 开头加 '('
        .replace(/$/, ')'); // 结尾加 ')'

    // 统计开括号数量并补充闭括号
    const openParens = (converted.match(/\(/g) || []).length;
    const closeParens = (converted.match(/\)/g) || []).length;
    const balancedExpr = converted + ')'.repeat(openParens - closeParens);

    try {
        // 输出转换后的代码，用于调试语法问题
        console.log("转换后的代码:", balancedExpr);
        return eval(`(${balancedExpr}).toNumber()`);
    } catch (e) {
        console.error('计算错误:', e);
        return NaN;
    }
}

// 修改后的handleEqual函数（添加调试日志）
function handleEqual() {
    console.log('--- 开始处理等号 ---');
    console.log('当前状态:', {
        expression,
        currentValue,
        lastOperator,
        lastOperand,
        isNewNumber
    });
    expression= addZero(expression);
    if (!(currentValue && expression)) {
        const cleanedExpression = sanitizeExpression(expression);
        console.log('清理后的表达式:', cleanedExpression);
        expression = cleanedExpression;
    }

    //
    let finalExpression = expression;
    // 处理当前值的小数
    let sanitizedCurrent = currentValue;
    if (sanitizedCurrent) {
        if (sanitizedCurrent.startsWith('.')) sanitizedCurrent = '0' + sanitizedCurrent;
        if (sanitizedCurrent.endsWith('.')) sanitizedCurrent += '0';
        currentValue = sanitizedCurrent;
    }

    if (expression === '' && currentValue === '') {
        return;
    }

    // 调试连续运算条件
    console.log('连续运算条件检查:', {
        exprEmpty: !finalExpression,
        hasCurrent: !!currentValue,
        hasOp: !!lastOperator,
        hasOperand: !!lastOperand
    });

    // 处理连续运算逻辑（关键修复）
    if (!finalExpression && currentValue && lastOperator && lastOperand) {
        finalExpression = `${currentValue}${lastOperator}${lastOperand}`;
        console.log('构建连续运算表达式:', finalExpression);
    } else if (currentValue) {
        finalExpression += currentValue;
        console.log('普通表达式:', finalExpression);
    }

    try {
        console.log('最终计算表达式:', finalExpression);

        const evalStr = finalExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');

        const result = eval(evalStr);
        console.log('最终表达式:',finalExpression)
        const result2 = safeEval(evalStr);
        console.log('计算结果:', result);
        console.log('安全计算结果:', result2);
        console.log(safeEval("3+6")); // 应该输出 9
        console.log(safeEval("3+6*2")); // 应该输出 15
        console.log(safeEval("3+6*(2-1)"));
        if (!isFinite(result)) throw new Error();


        // 显示结果
        display.value = formatDisplay(String(result));

        //TODO 需要考虑expression的处理，切换运算符后 expression 会被清空

        // 状态更新逻辑（关键修改）
        currentValue = String(result);
        //fix:如果切换运算符后，按等号不计算直到按新数字
        expression = '';
        isNewNumber = true;

        // 保留运算符和操作数（新增代码）
        if (lastOperator) {
            // 不重置 lastOperator，仅更新操作数
            const operands = finalExpression.split(/[+\-×÷]/);
            lastOperand = operands.pop() || lastOperand;
            console.log('保留运算符:', lastOperator, '操作数:', lastOperand);
        }
        // // 正确保存最后操作数（保留原始操作数）
        // if (lastOperator) {
        //     // 从表达式中提取最后操作数（而不是使用结果）
        //     const operands = finalExpression.split(/[+\-*/]/);
        //     lastOperand = operands[operands.length - 1] || lastOperand;
        //     console.log('更新最后操作数为:', lastOperand);
        // }
    } catch (e) {
        console.error('计算错误:', e);
        showError();
        currentValue = '';
        expression = '';
        isNewNumber = true;
    }

    console.log('处理后状态:', {
        currentValue,
        expression,
        lastOperator,
        lastOperand,
        isNewNumber
    });
    console.log('--- 结束处理等号 ---\n');
}

// 修改handleOperator函数（添加日志）
function handleOperator(operatorType) {
    console.log('--- 处理运算符 ---', operatorType);
    const operatorMap = {
        'add': '+',
        'subtract': '-',
        'multiply': '×',
        'divide': '÷'
    };
    const operator = operatorMap[operatorType];

    if (currentValue !== '') {
        console.log('将当前值加入表达式:', currentValue);
        expression += currentValue;
        currentValue = '';
    }

    // 记录最后操作数（关键修复）
    if (expression) {
        const operands = expression.split(/[+\-×÷]/);
        lastOperand = operands[operands.length - 1];
        console.log('更新最后操作数:', lastOperand);
    }

    // 替换连续运算符逻辑
    const lastChar = expression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
        console.log('替换运算符:', `${lastChar} → ${operator}`);
        expression = expression.slice(0, -1) + operator;
    } else {
        console.log('追加运算符:', operator);
        expression += operator;
    }

    lastOperator = operator;
    isNewNumber = true;

    console.log('处理后状态:', {
        expression,
        currentValue,
        lastOperator,
        lastOperand
    });
    console.log('--- 结束处理运算符 ---\n');

    // 显式记录运算符（新增代码）
    lastOperator = operatorMap[operatorType];
    console.log('记录新运算符:', lastOperator);

}
// 处理特殊功能
function handleSpecial(action) {
    switch (action) {
        case 'clear':
            // 新增状态重置
            lastOperator = null;
            lastOperand = null;
            currentValue = '';
            expression = '';
            display.value = '0';
            isNewNumber = true;
            break;

        case 'percent':
            if (currentValue) {
                currentValue = String(parseFloat(currentValue) / 100);
                display.value = currentValue;
            }
            break;

        case 'sign':
            if (currentValue) {
                currentValue = String(parseFloat(currentValue) * -1)
                display.value = currentValue;
            }
            break;

        case 'decimal':
            if (!currentValue.includes('.')) {
                // 当当前值为空时，自动补0
                if (currentValue === '') {
                    currentValue = '0.';
                } else {
                    currentValue += '.';
                }
                display.value = currentValue;
                isNewNumber = false;
            }
            break;
    }
}

// 让屏幕上数字根据宽度 自适应变化大小
function adaptive(disNumber) {
    // let displayWidth = document.getElementById('#display').getBoundingClientRect.width;
    let displayWidth = document.getElementById('display').offsetWidth;
    numberLength = String(disNumber).length;
    sizeNum = displayWidth / numberLength;

    sizeNum = sizeNum * 1.5;
    let onlyNumber = org_size.substring(0, org_size.length - 2)
    if (sizeNum > onlyNumber) {
        sizeNum = onlyNumber;
    }
    return sizeNum;

}
function fitTextToContainer() {
    const input = document.getElementById("display");
    const measureSpan = document.getElementById("measure-span");
    const containerWidth = input.clientWidth; // 获取 input 的宽度
    let fontSize = 96; // 初始字体大小
    measureSpan.style.fontSize = fontSize + "px";

    // 将 input 的值同步到 span 中
    measureSpan.textContent = input.value;

    // 如果文字宽度超过容器宽度，逐步缩小字体
    while (measureSpan.scrollWidth > containerWidth && fontSize > 0) {
        fontSize -= 1;
        measureSpan.style.fontSize = fontSize + "px";
    }

    // 将最终的字体大小应用到 input
    input.style.fontSize = fontSize + "px";
}
// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// 事件监听
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        const id = button.id;

        if (id === 'clean') {
            handleSpecial('clear');
        } else if (id === 'posi-and-nega') {
            handleSpecial('sign');
        } else if (id === 'percent') {
            handleSpecial('percent');
        } else if (id === 'dot') {
            handleSpecial('decimal');
        } else if (id === 'equal') {
            handleEqual();
        } else if (['add', 'subtract', 'multiply', 'divide'].includes(id)) {
            handleOperator(id);
        } else if (id.match(/zero|one|two|three|four|five|six|seven|eight|nine/)) {
            handleNumber(button.textContent.trim());
        }
        
        window.addEventListener("resize", debounce(adaptive(display.value), 200));
        document.querySelector('#display').style.fontSize = sizeNum + 'px';
    });
    
});
