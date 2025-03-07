//设置键盘绑定监听事件
const keyboardContainer = document.querySelector('.keyboard');
const screen = document.querySelector('#display').value;
let previousNumber = '', //上一个值
    currentNumber = '', //当前值
    displayNumber = '', //显示值，接收 计算结果、按钮数字
    //尝试用来存储之前的结果 
    bak_preResult = '', // 备份值结果，用来在 各种符号之间切换需要调去原来的计算值
    bak_sign = '', // 备份符号
    bak_currentNumber = '', //备份当前数字；
    bak_previousNumber = '',
    do_calculator = true,
    hold = true,
    isEqual = false,
    sign = '';  //记录上次运算操作符号


keyboardContainer.addEventListener('click', e => {
    // 捕获 Id、Class、TextContent的内容 来区分不同的button 执行相应的操作。
    const textContent = e.target.textContent;
    const btnId = e.target.id;
    const className = e.target.className;

    //如果Target获取的不是button标签（父级标签）则不处理监听。
    if (e.target.nodeName === 'BUTTON') {
        // 事件处理分为监听获取数字button、运算符号、清除等。
        // 如果是operational类元素 则表示是「操作按钮」；否则就是「数字按钮」。
        if (className === 'operational') {
            operational(btnId);
        } else {
            pressNumber(textContent);
        }
    }
})


org_text = document.getElementById('display');
org_size = window.getComputedStyle(org_text).fontSize;
// 让屏幕上数字根据宽度 自适应变化大小
function adaptive(disNumber) {
    // let displayWidth = document.getElementById('#display').getBoundingClientRect.width;
    let displayWidth = document.getElementById('display').offsetWidth;
    numberLength = String(disNumber).length;
    sizeNum = displayWidth / numberLength;

    sizeNum = sizeNum * 1.5;
    let onlyNumber = org_size.substring(0,org_size.length-2)
    if (sizeNum > onlyNumber) {
        sizeNum = onlyNumber;
    }
    return sizeNum;

}


//更新显示
function updateDisplay() {

    if (String(displayNumber) === 'NaN' || String(displayNumber) === 'Infinity' || String(displayNumber) === '-Infinity') {
        document.querySelector('#display').value = '';
        document.querySelector('#display').placeholder = '错误';
    } else {
        document.querySelector('#display').value = displayNumber;

    }
    let num_length = displayNumber;
    adaptive(num_length);
    document.querySelector('#display').style.fontSize = sizeNum + 'px';


};

// 清除功能，第一次按 仅清除了当前数 ；第二次按 清除所有数字

function clean() {

    if (displayNumber != '') {
        displayNumber = '';
        currentNumber = '';
        if (hold == false || sign === '') {
            hold = true;
        } else {
            rec_sign = sign;
            document.getElementById(rec_sign).style.backgroundColor = 'white';
            document.getElementById(rec_sign).style.color = '#FCA00B';
        }

        document.querySelector('#display').placeholder = '0';
        document.getElementById('clean').textContent = 'AC';
    } else {
        previousNumber = '';
        currentNumber = '';
        displayNumber = '';
        bak_preResult = '';
        bak_sign = '';
        bak_currentNumber = '';
        bak_previousNumber = '';
        do_calculator = true;
        sign = '';
        clearStyle();
    }
    
}
// 操作符 加减乘除 hold 状态
function holdButton(btn_id) {

    clearStyle();


    let change = btn_id;

    document.getElementById(change).style.backgroundColor = 'white';
    document.getElementById(change).style.color = '#FCA00B';


}
// 清楚 hold 状态 样式
function clearStyle() {
    document.getElementById('add').style.backgroundColor = '#FCA00B';
    document.getElementById('add').style.color = 'white';
    document.getElementById('subtract').style.backgroundColor = '#FCA00B';
    document.getElementById('subtract').style.color = 'white';
    document.getElementById('multiply').style.backgroundColor = '#FCA00B';
    document.getElementById('multiply').style.color = 'white';
    document.getElementById('divide').style.backgroundColor = '#FCA00B';
    document.getElementById('divide').style.color = 'white';
}
 
//preeNumber 用来接收数字；btn_number 用来获取button标签内的值
function pressNumber(btn_number) {
    clearStyle();
    //有例外情况 为了准确显示 ‘xxx.’情况 临时把值传给placeholder，然后再恢复传给displayNumber

    // 每次输入数字 即将产生当前值，这时候clean键会为「C」；再次按下clean键会变为「AC」
    
    document.getElementById('clean').textContent = 'C';
    if (isEqual == true) {
        previousNumber = '';
    }
    isEqual = false;

    //开头不能为「0」
    if (btn_number === '0' && currentNumber === '0' || btn_number === '0' && currentNumber === '-0') {  //开头不能为0
        btn_number = ''; //清空得到的「0」
    }

    // 如果开头是「.」,处理成「0.」 
    if (btn_number === '.' && currentNumber.length == 0) {
        currentNumber = '0.'
        // 「0.」不给直接传给input；把数字给placeholder
        document.querySelector('#display').placeholder = String(currentNumber);
    }

    // 只能输入一个小数点；如果当前数字有「.」则屏蔽后面输入的「.」
    if (btn_number === '.' && currentNumber.indexOf('.') != -1) {
        btn_number = '';
    }

    if (currentNumber === '-0' && btn_number !== '.' && btn_number !== '') {
        currentNumber = '-';
    }
    if (currentNumber === '0' && btn_number !== '.' && btn_number !== '') {
        currentNumber = '';
    }
     

    // 把数字给当前值
    // 拼接数字
    currentNumber = currentNumber + btn_number;

    // 如果 当前值结尾为「xxx.」
    if (currentNumber.charAt(currentNumber.length - 1) == '.') {
        document.querySelector('#display').placeholder = String(currentNumber);
        displayNumber = ''; //  让placeholder显示出来。
        
        updateDisplay();
    } else {
        displayNumber = currentNumber;
        document.querySelector('#display').placeholder = '0';
        updateDisplay();
    }

    
    
}

// 操作按钮
function operational(btn_id) {
    // 把仅为‘-’的currentNumber 重置
    // 比如按了 posi-and-nega 后没有输入数字，这时候又按了操作按钮 则是视为 ‘’值
    // if (currentNumber === '-') {
    //     currentNumber = '';
    // }
    switch (btn_id) {
        case 'clean':
            
            clean();
            break;
        case 'posi-and-nega':
            clearStyle();
            if (previousNumber !== '' && currentNumber === '') {
                currentNumber = previousNumber;
                
            }
            if (currentNumber === '' || currentNumber === '0') {
                document.querySelector('#display').placeholder = '-0';
                currentNumber = '-0';
                // displayNumber = currentNumber;
                
            } else if (currentNumber === '-0') {
                document.querySelector('#display').placeholder = '0';
                currentNumber = '0';
                // displayNumber = currentNumber;
            } else {

                currentNumber = -1 * Number(currentNumber);
                displayNumber = currentNumber;
                
            }
            
            isEqual = false;
            break;
        case 'percent':
            clearStyle();
            if (previousNumber !== '' && currentNumber === '') {
                currentNumber = previousNumber;
            }
            // currentNumber = currentNumber / 100;
            if (currentNumber !== '') {
                currentNumber = currentNumber / 100;
                // currentNumber = new Decimal(currentNumber).div(new Decimal(100))
                currentNumber = parseFloat(currentNumber.toFixed(12));
            }
            //处理精度
            // ？？？？
            displayNumber = currentNumber;
            
            isEqual = false;
            break;
        case 'add':
            holdButton(btn_id);
            
            opr_Judgment(btn_id);
            isEqual = false;
            break;
        case 'subtract':
            holdButton(btn_id);
            
            opr_Judgment(btn_id);
            isEqual = false;
            break;
        case 'multiply':
            holdButton(btn_id);
            
            opr_Judgment(btn_id);
            isEqual = false;
            break;
        case 'divide':
            holdButton(btn_id);
            
            opr_Judgment(btn_id);
            isEqual = false;
            break;
        case 'equal':
            clearStyle();
            if (isEqual == true) {

                if (bak_currentNumber !== '') {
                    currentNumber = bak_currentNumber;
                } else if (currentNumber === '') {
                    bak_currentNumber = previousNumber;
                    currentNumber = bak_currentNumber;
                    console.log(currentNumber)
                }
                calculator(sign);
                currentNumber = '';
                displayNumber = previousNumber;

            }
            else {
                opr_Judgment(btn_id);
                // if (bak_currentNumber !== '') {
                //     currentNumber = bak_currentNumber;
                // } else if (currentNumber === '') {
                //     bak_currentNumber = previousNumber;
                //     currentNumber = bak_currentNumber;
                //     console.log(currentNumber)
                // }
                // calculator(sign);
                // currentNumber = '';
                // displayNumber = previousNumber;
            }
            isEqual = true;
            //只有连续按下等号才会执行以下操作 默认运算上一次数字 如果没有就自运算
            // previousNumber = '';
            bak_preResult = '';
            bak_sign = '';
            bak_previousNumber = '';
            hold = false;
            
            break;
    }

    updateDisplay();
}

// 1获取符号、2判断运算优先级  opr_Judgment 方法写的逻辑有问题
function opr_Judgment(curr_sign) { //curr_sign 当前符号
    
    // 从一级运算升到二级运算
    console.log('start')
    if ((curr_sign === 'multiply' || curr_sign === 'divide') && (sign === 'add' || sign === 'subtract')) {
        // previousNumber
        

        if (currentNumber !== '') {
            
            bak_preResult = previousNumber;
            bak_currentNumber = currentNumber;
            previousNumber = currentNumber;
            currentNumber = '';
            bak_sign = sign;
            // do_calculator = false; 不用明确为false  因为curr 为空时 不会计算
        } else {
            
            if (bak_previousNumber === '') {
                currentNumber = bak_currentNumber;
            } else {
                currentNumber = bak_previousNumber;
            }
            bak_sign = sign;
            do_calculator = false;
        }

    }

    // 从二级运算降到一级运算
    if ((curr_sign === 'add' || curr_sign === 'subtract' || curr_sign === 'equal') && (sign === 'multiply' || sign === 'divide')) {
        // 1+2 - 3  
        
        if (currentNumber !== '') {
            
            calculator(sign);
            bak_currentNumber = currentNumber;// 疑似与equal冲突
            // 
            bak_previousNumber = previousNumber;
            // 
            // bak_previousNumber = currentNumber;
            currentNumber = previousNumber;
            if (bak_preResult === '') {
                do_calculator = false;
            } else {
                previousNumber = bak_preResult;
                do_calculator = true;
                sign = bak_sign;
            }
        }
        else {
            

            if (bak_preResult !== '') {
                if (bak_previousNumber === '') {
                    currentNumber = bak_currentNumber;
                } else {
                    currentNumber = bak_previousNumber;
                }
                previousNumber = bak_preResult;
                do_calculator = true;
                // sign = curr_sign;
                
            } else {
                // do_calculator = false;
                
            }

            // if (bak_previousNumber === '') {
            //     currentNumber = bak_currentNumber;
            // } else {
            //     currentNumber = bak_previousNumber;
            // }
            // 
            // if (bak_preResult === '') {
            //     do_calculator = false;
            // } else {
            //     previousNumber = bak_preResult;
            //     do_calculator = true;
            // }

            // 
        }
        // sign = bak_sign;    //把保存的符号 给 sign
    }

    if (previousNumber !== '' && currentNumber !== '') {
        if (do_calculator == false) {
            do_calculator = true;
            console.log('no-calc!')
        } else {
            console.log('do-calu!')
            if (curr_sign === 'multiply' || curr_sign === 'divide') {

            } else {

                bak_preResult = previousNumber;
            }
            bak_currentNumber = currentNumber;
            calculator(sign);
            
            // bak_previousNumber = previousNumber;
            currentNumber = '';

        }
    }


    if (currentNumber !== '') {
        previousNumber = currentNumber;
        currentNumber = '';
        console.log('Yes!' + previousNumber)
    }
    if (curr_sign !== 'equal') {
        sign = curr_sign; //把当前符号记录下来 下次计算
    }
    displayNumber = previousNumber;
    // bak_previousNumber = displayNumber;
    
}

// 计算方法
function calculator(sign) { //计算方法 等待优化 精度处理 运算规则 错误计算结果处理
    switch (sign) {
        case 'add':
            previousNumber = Number(previousNumber) + Number(currentNumber);
            previousNumber = parseFloat(previousNumber.toFixed(12));
            // 加法
            // previousNumber = new Decimal(previousNumber).add(new Decimal(currentNumber));
            // previousNumber = parseFloat(previousNumber.toFixed(6));
            break;

        case 'subtract':
            previousNumber = Number(previousNumber) - Number(currentNumber);
            previousNumber = parseFloat(previousNumber.toFixed(12));
            // previousNumber = new Decimal(previousNumber).sub(new Decimal(currentNumber));
            // previousNumber = parseFloat(previousNumber.toFixed(6));
            break;
        case 'multiply':
            previousNumber = Number(previousNumber) * Number(currentNumber);
            previousNumber = parseFloat(previousNumber.toFixed(12));
            // previousNumber = new Decimal(previousNumber).mul(new Decimal(currentNumber));
            // previousNumber = parseFloat(previousNumber.toFixed(6));
            break;
        case 'divide':
            previousNumber = Number(previousNumber) / Number(currentNumber);
            previousNumber = parseFloat(previousNumber.toFixed(12));
            // previousNumber = new Decimal(previousNumber).div(new Decimal(currentNumber));
            // previousNumber = parseFloat(previousNumber.toFixed(6));
            break;


    }

}


