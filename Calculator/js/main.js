const display = document.getElementById('display');
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
}
// 新增显示格式化函数
// 增强的formatDisplay函数（处理科学计数法）
function formatDisplay(value) {
    if (value.endsWith('.')) return value;
    const number = parseFloat(value);
    
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

    let finalExpression = expression;
    
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
        console.log('计算结果:', result);
        
        if (!isFinite(result)) throw new Error();

        // 显示结果
        display.value = formatDisplay(String(result));

        TODO 需要考虑expression的处理，切换运算符后 expression 会被清空
        
        // 状态更新逻辑（关键修改）
        currentValue = String(result);
        
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
    switch(action) {
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
    });
});
