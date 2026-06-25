// Extensão para micro:bit V2 com LCD 16x2 I2C e Teclado 4x4
// Endereços: LCD 0x27, Teclado 0x20

//% color="#0078d7" icon="\uf120" weight=100
namespace MakerBit {
    // Constantes para LCD
    const LCD_CLEAR = 0x01;
    const LCD_HOME = 0x02;
    const LCD_ENTRY_MODE = 0x04;
    const LCD_ENTRY_INC = 0x02;
    const LCD_ENTRY_SHIFT = 0x01;
    const LCD_ON = 0x08;
    const LCD_ON_DISPLAY = 0x04;
    const LCD_ON_CURSOR = 0x02;
    const LCD_ON_BLINK = 0x01;
    const LCD_MOVE = 0x10;
    const LCD_MOVE_DISPLAY = 0x08;
    const LCD_MOVE_RIGHT = 0x04;
    const LCD_MOVE_LEFT = 0x00;
    const LCD_FUNCTION = 0x20;
    const LCD_FUNCTION_8BIT = 0x10;
    const LCD_FUNCTION_2LINE = 0x08;
    const LCD_FUNCTION_5X10 = 0x04;
    const LCD_BACKLIGHT = 0x08;
    const LCD_NOBACKLIGHT = 0x00;
    const LCD_ENABLE_BIT = 0x04;
    const LCD_READ_WRITE_BIT = 0x02;
    const LCD_REGISTER_SELECT_BIT = 0x01;
    const LCD_CMD = 0x00;
    const LCD_CHR = 0x01;

    // Endereços padrão
    const LCD_ADDR = 0x27;
    const KEYPAD_ADDR = 0x20;

    let lcdInitialized = false;
    let backlightState = true;

    // Matriz do teclado 4x4
    const KEYPAD_KEYS = [
        ['1', '2', '3', 'A'],
        ['4', '5', '6', 'B'],
        ['7', '8', '9', 'C'],
        ['*', '0', '#', 'D']
    ];

    // Caracteres especiais pré-definidos
    export enum CustomChar {
        //% block="Heart"
        Heart,
        //% block="Arrow Right"
        ArrowRight,
        //% block="Arrow Left"
        ArrowLeft,
        //% block="Smile"
        Smile,
        //% block="Square"
        Square,
        //% block="Circle"
        Circle,
        //% block="Triangle"
        Triangle,
        //% block="Star"
        Star
    }

    /**
     * Inicializa o LCD 16x2
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_init" block="Inicializar LCD I2C endereço %addr"
    //% addr.defl=0x27
    //% weight=100
    export function initLcd(addr: number = 0x27): void {
        if (lcdInitialized) return;

        // Inicialização do LCD em 4 bits
        pins.i2cWriteNumber(addr, 0x30, NumberFormat.UInt8BE);
        basic.pause(5);
        pins.i2cWriteNumber(addr, 0x30, NumberFormat.UInt8BE);
        basic.pause(5);
        pins.i2cWriteNumber(addr, 0x30, NumberFormat.UInt8BE);
        basic.pause(1);
        pins.i2cWriteNumber(addr, 0x20, NumberFormat.UInt8BE);
        basic.pause(1);

        lcdCommand(0x28, addr); // 4 bits, 2 linhas, 5x8
        lcdCommand(0x08, addr); // display off
        lcdCommand(0x01, addr); // clear
        lcdCommand(0x06, addr); // entry mode
        lcdCommand(0x0C, addr); // display on, cursor off, blink off

        backlightState = true;
        lcdInitialized = true;
    }

    /**
     * Envia um comando para o LCD
     */
    function lcdCommand(cmd: number, addr: number): void {
        const high = (cmd & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT);
        const low = ((cmd << 4) & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT);

        write4Bits(high, addr, LCD_CMD);
        write4Bits(low, addr, LCD_CMD);
    }

    /**
     * Envia dados para o LCD
     */
    function lcdData(data: number, addr: number): void {
        const high = (data & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT) | 0x01;
        const low = ((data << 4) & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT) | 0x01;

        write4Bits(high, addr, LCD_CHR);
        write4Bits(low, addr, LCD_CHR);
    }

    /**
     * Escreve 4 bits no LCD
     */
    function write4Bits(value: number, addr: number, mode: number): void {
        pins.i2cWriteNumber(addr, value, NumberFormat.UInt8BE);
        basic.pause(1);
        pins.i2cWriteNumber(addr, value | LCD_ENABLE_BIT, NumberFormat.UInt8BE);
        basic.pause(1);
        pins.i2cWriteNumber(addr, value & ~LCD_ENABLE_BIT, NumberFormat.UInt8BE);
        basic.pause(1);
    }

    /**
     * Limpa o display LCD
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_clear" block="LCD Limpar display"
    //% weight=89
    export function clearLcd(): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);
        lcdCommand(LCD_CLEAR, LCD_ADDR);
        basic.pause(2);
    }

    /**
     * Posiciona o cursor no LCD
     * @param row Linha (0-1)
     * @param col Coluna (0-15)
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_cursor" block="LCD posicionar cursor linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=88
    export function lcdCursor(row: number, col: number): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);
        const position = 0x80 + (row * 0x40 + col);
        lcdCommand(position, LCD_ADDR);
    }

    /**
     * Escreve um texto no LCD
     * @param text Texto a ser exibido
     * @param row Linha (0-1)
     * @param col Coluna (0-15)
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_show_text" block="LCD exibir %text|na linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=87
    export function showText(text: string, row: number = 0, col: number = 0): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);
        lcdCursor(row, col);
        const chars = text.split('');
        for (let i = 0; i < chars.length && i < 16 - col; i++) {
            lcdData(chars[i].charCodeAt(0), LCD_ADDR);
        }
    }

    /**
     * Cria um caractere personalizado
     * @param charNum Número do caractere (0-7)
     * @param pattern Array de 8 bytes definindo o padrão
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_create_char" block="LCD criar caractere %charNum|padrão %pattern"
    //% charNum.min=0 charNum.max=7
    //% weight=86
    export function createCustomChar(charNum: number, pattern: number[]): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);
        if (charNum < 0 || charNum > 7) return;

        lcdCommand(0x40 + (charNum * 8), LCD_ADDR);
        for (let i = 0; i < 8; i++) {
            if (i < pattern.length) {
                lcdData(pattern[i] & 0x1F, LCD_ADDR);
            } else {
                lcdData(0x00, LCD_ADDR);
            }
        }
    }

    /**
     * Exibe um caractere personalizado no LCD
     * @param charNum Número do caractere (0-7)
     * @param row Linha (0-1)
     * @param col Coluna (0-15)
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_show_custom" block="LCD exibir caractere %charNum|na linha %row coluna %col"
    //% charNum.min=0 charNum.max=7
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=85
    export function showCustomChar(charNum: number, row: number, col: number): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);
        lcdCursor(row, col);
        lcdData(charNum, LCD_ADDR);
    }

    /**
     * Exibe um caractere especial pré-definido
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_show_special" block="LCD exibir caractere especial %char|na linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=84
    export function showSpecialChar(char: CustomChar, row: number, col: number): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);

        const patterns = getSpecialCharPattern(char);
        createCustomChar(0, patterns);
        showCustomChar(0, row, col);
    }

    /**
     * Retorna o padrão para caracteres especiais
     */
    function getSpecialCharPattern(char: CustomChar): number[] {
        switch (char) {
            case CustomChar.Heart:
                return [0x00, 0x0A, 0x1F, 0x1F, 0x1F, 0x0E, 0x04, 0x00];
            case CustomChar.ArrowRight:
                return [0x00, 0x04, 0x0C, 0x1C, 0x1C, 0x0C, 0x04, 0x00];
            case CustomChar.ArrowLeft:
                return [0x00, 0x04, 0x06, 0x07, 0x07, 0x06, 0x04, 0x00];
            case CustomChar.Smile:
                return [0x00, 0x00, 0x0A, 0x00, 0x11, 0x0E, 0x00, 0x00];
            case CustomChar.Square:
                return [0x00, 0x1F, 0x11, 0x11, 0x11, 0x11, 0x1F, 0x00];
            case CustomChar.Circle:
                return [0x00, 0x0E, 0x11, 0x11, 0x11, 0x11, 0x0E, 0x00];
            case CustomChar.Triangle:
                return [0x00, 0x04, 0x0E, 0x1F, 0x00, 0x00, 0x00, 0x00];
            case CustomChar.Star:
                return [0x00, 0x04, 0x0A, 0x1F, 0x04, 0x0A, 0x11, 0x00];
            default:
                return [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        }
    }

    /**
     * Liga/desliga o backlight
     */
    //% subcategory="LCD"
    //% blockId="makerbit_lcd_backlight" block="LCD backlight %state"
    //% weight=83
    export function lcdBacklight(state: boolean): void {
        if (!lcdInitialized) initLcd(LCD_ADDR);
        backlightState = state;
        lcdCommand(0x00, LCD_ADDR);
    }

    /**
     * Inicializa o teclado 4x4
     */
    //% subcategory="Teclado"
    //% blockId="makerbit_keypad_init" block="Inicializar teclado 4x4 endereço %addr"
    //% addr.defl=0x20
    //% weight=80
    export function initKeypad(addr: number = 0x20): void {
        // Configuração inicial do PCF8574
        pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
        basic.pause(10);
    }

    /**
     * Lê uma tecla do teclado 4x4
     * @returns String com a tecla pressionada ou "" se nenhuma
     */
    //% subcategory="Teclado"
    //% blockId="makerbit_keypad_read" block="Teclado ler tecla"
    //% weight=79
    export function readKey(): string {
        const addr = KEYPAD_ADDR;

        // Configuração das colunas como saída e linhas como entrada
        for (let col = 0; col < 4; col++) {
            // Coloca 0 na coluna atual
            let output = 0xFF;
            output &= ~(1 << (col + 4)); // Colunas nos bits 4-7
            pins.i2cWriteNumber(addr, output, NumberFormat.UInt8BE);
            basic.pause(1);

            // Lê as linhas
            const input = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);

            // Verifica cada linha
            for (let row = 0; row < 4; row++) {
                if ((input & (1 << row)) === 0) {
                    // Tecla encontrada
                    pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
                    return KEYPAD_KEYS[row][col];
                }
            }

            // Restaura a saída
            pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
            basic.pause(1);
        }

        return "";
    }

    /**
     * Aguarda até uma tecla ser pressionada
     * @param timeout Tempo máximo de espera em ms (0 = espera infinita)
     * @returns String com a tecla pressionada
     */
    //% subcategory="Teclado"
    //% blockId="makerbit_keypad_wait" block="Teclado aguardar tecla %timeout ms"
    //% weight=78
    export function waitForKey(timeout: number = 0): string {
        const start = control.millis();
        while (timeout === 0 || control.millis() - start < timeout) {
            const key = readKey();
            if (key !== "") {
                return key;
            }
            basic.pause(10);
        }
        return "";
    }

    /**
     * Verifica se uma tecla específica foi pressionada
     * @param key Tecla a verificar
     * @returns true se a tecla foi pressionada
     */
    //% subcategory="Teclado"
    //% blockId="makerbit_keypad_is_pressed" block="Teclado tecla %key está pressionada"
    //% weight=77
    export function isKeyPressed(key: string): boolean {
        return readKey() === key;
    }

    /**
     * Lê todas as teclas pressionadas simultaneamente
     * @returns Array de strings com as teclas pressionadas
     */
    //% subcategory="Teclado"
    //% blockId="makerbit_keypad_read_all" block="Teclado ler todas as teclas"
    //% weight=76
    export function readAllKeys(): string[] {
        const addr = KEYPAD_ADDR;
        const pressedKeys: string[] = [];

        for (let col = 0; col < 4; col++) {
            let output = 0xFF;
            output &= ~(1 << (col + 4));
            pins.i2cWriteNumber(addr, output, NumberFormat.UInt8BE);
            basic.pause(1);

            const input = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);

            for (let row = 0; row < 4; row++) {
                if ((input & (1 << row)) === 0) {
                    pressedKeys.push(KEYPAD_KEYS[row][col]);
                }
            }

            pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
            basic.pause(1);
        }

        return pressedKeys;
    }

    /**
     * Exemplo completo de uso
     */
    //% subcategory="Exemplos"
    //% blockId="makerbit_example_basic" block="Exemplo: LCD + Teclado"
    //% weight=1
    export function basicExample(): void {
        // Inicializa os dispositivos
        initLcd(LCD_ADDR);
        initKeypad(KEYPAD_ADDR);

        // Limpa o display
        clearLcd();

        // Mostra mensagem inicial
        showText("Pressione uma", 0, 0);
        showText("tecla", 1, 0);

        // Aguarda uma tecla
        const key = waitForKey(0);

        // Limpa e mostra a tecla
        clearLcd();
        showText("Tecla:", 0, 0);
        showText(key, 1, 5);

        // Mostra caracteres especiais
        basic.pause(2000);
        clearLcd();
        showText("Caracteres:", 0, 0);
        showSpecialChar(CustomChar.Heart, 1, 0);
        showSpecialChar(CustomChar.Smile, 1, 2);
        showSpecialChar(CustomChar.Star, 1, 4);
        showSpecialChar(CustomChar.Square, 1, 6);
    }
}