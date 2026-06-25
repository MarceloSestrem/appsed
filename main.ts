// Extensão para micro:bit V2 com LCD 16x2 I2C e Teclado 4x4
// Endereços: LCD 0x27, Teclado 0x20
// namespace: appsSed

//% color="#0078d7" icon="\uf120" weight=100
namespace appsSed {
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
        //% block="Coração"
        Heart,
        //% block="Seta Direita"
        ArrowRight,
        //% block="Seta Esquerda"
        ArrowLeft,
        //% block="Sorriso"
        Smile,
        //% block="Quadrado"
        Square,
        //% block="Círculo"
        Circle,
        //% block="Triângulo"
        Triangle,
        //% block="Estrela"
        Star,
        //% block="Nota Musical"
        MusicNote,
        //% block="Coração Duplo"
        DoubleHeart
    }

    /**
     * Inicializa o LCD 16x2
     * @param addr Endereço I2C do LCD, padrão 0x27
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_init" block="LCD Inicializar endereço %addr"
    //% addr.defl=0x27
    //% weight=100
    export function lcdInit(addr: number = 0x27): void {
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
     * Limpa o display LCD completamente
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_clear" block="LCD Limpar display"
    //% weight=99
    export function lcdClear(): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
        lcdCommand(LCD_CLEAR, LCD_ADDR);
        basic.pause(2);
    }

    /**
     * Posiciona o cursor no LCD
     * @param row Linha (0-1)
     * @param col Coluna (0-15)
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_cursor" block="LCD Posicionar cursor linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=98
    export function lcdSetCursor(row: number, col: number): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
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
    //% blockId="appssed_lcd_show_text" block="LCD Exibir %text|na linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=97
    export function lcdShowText(text: string, row: number = 0, col: number = 0): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
        lcdSetCursor(row, col);
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
    //% blockId="appssed_lcd_create_char" block="LCD Criar caractere %charNum|padrão %pattern"
    //% charNum.min=0 charNum.max=7
    //% weight=96
    export function lcdCreateChar(charNum: number, pattern: number[]): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
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
    //% blockId="appssed_lcd_show_custom" block="LCD Exibir caractere %charNum|na linha %row coluna %col"
    //% charNum.min=0 charNum.max=7
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=95
    export function lcdShowCustomChar(charNum: number, row: number, col: number): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
        lcdSetCursor(row, col);
        lcdData(charNum, LCD_ADDR);
    }

    /**
     * Exibe um caractere especial pré-definido
     * @param char Caractere especial
     * @param row Linha (0-1)
     * @param col Coluna (0-15)
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_show_special" block="LCD Exibir caractere especial %char|na linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=94
    export function lcdShowSpecialChar(char: CustomChar, row: number, col: number): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);

        const patterns = getSpecialCharPattern(char);
        lcdCreateChar(0, patterns);
        lcdShowCustomChar(0, row, col);
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
            case CustomChar.MusicNote:
                return [0x00, 0x06, 0x0A, 0x0A, 0x16, 0x12, 0x0E, 0x00];
            case CustomChar.DoubleHeart:
                return [0x00, 0x0A, 0x1F, 0x1F, 0x0A, 0x1F, 0x1F, 0x0A];
            default:
                return [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        }
    }

    /**
     * Liga/desliga o backlight do LCD
     * @param state true = ligado, false = desligado
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_backlight" block="LCD Backlight %state"
    //% weight=93
    export function lcdBacklight(state: boolean): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
        backlightState = state;
        lcdCommand(0x00, LCD_ADDR);
    }

    /**
     * Exibe texto com rolagem no LCD
     * @param text Texto a ser exibido
     * @param row Linha (0-1)
     * @param speed Velocidade da rolagem em ms
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_scroll_text" block="LCD Exibir com rolagem %text|na linha %row|velocidade %speed ms"
    //% row.min=0 row.max=1
    //% speed.min=100 speed.max=1000
    //% weight=92
    export function lcdScrollText(text: string, row: number = 0, speed: number = 300): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);

        // Adiciona espaços para rolagem
        const paddedText = text + "     ";

        for (let i = 0; i < paddedText.length - 15; i++) {
            lcdSetCursor(row, 0);
            const displayText = paddedText.substr(i, 16);
            lcdShowText(displayText, row, 0);
            basic.pause(speed);
        }
    }

    /**
     * Inicializa o teclado 4x4
     * @param addr Endereço I2C do teclado, padrão 0x20
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_init" block="Teclado Inicializar endereço %addr"
    //% addr.defl=0x20
    //% weight=80
    export function keypadInit(addr: number = 0x20): void {
        // Configuração inicial do PCF8574
        pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
        basic.pause(10);
    }

    /**
     * Lê uma tecla do teclado 4x4
     * @param addr Endereço I2C do teclado
     * @returns String com a tecla pressionada ou "" se nenhuma
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_read" block="Teclado Ler tecla"
    //% weight=79
    export function keypadReadKey(addr: number = 0x20): string {
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
     * @param addr Endereço I2C do teclado
     * @returns String com a tecla pressionada
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_wait" block="Teclado Aguardar tecla %timeout ms"
    //% weight=78
    export function keypadWaitForKey(timeout: number = 0, addr: number = 0x20): string {
        const start = control.millis();
        while (timeout === 0 || control.millis() - start < timeout) {
            const key = keypadReadKey(addr);
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
     * @param addr Endereço I2C do teclado
     * @returns true se a tecla foi pressionada
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_is_pressed" block="Teclado Tecla %key está pressionada"
    //% weight=77
    export function keypadIsKeyPressed(key: string, addr: number = 0x20): boolean {
        return keypadReadKey(addr) === key;
    }

    /**
     * Lê todas as teclas pressionadas simultaneamente
     * @param addr Endereço I2C do teclado
     * @returns Array de strings com as teclas pressionadas
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_read_all" block="Teclado Ler todas as teclas"
    //% weight=76
    export function keypadReadAllKeys(addr: number = 0x20): string[] {
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
     * Converte tecla para número
     * @param key Tecla a ser convertida
     * @returns Número correspondente ou -1 se não for número
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_to_number" block="Teclado Converter %key para número"
    //% weight=75
    export function keypadKeyToNumber(key: string): number {
        const num = parseInt(key);
        return isNaN(num) ? -1 : num;
    }

    /**
     * Exemplo completo de uso - LCD + Teclado
     * Mostra como usar todos os recursos da extensão
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_complete" block="Exemplo: LCD + Teclado completo"
    //% weight=1
    export function exampleComplete(): void {
        // Inicializa os dispositivos
        lcdInit(LCD_ADDR);
        keypadInit(KEYPAD_ADDR);

        // Limpa o display
        lcdClear();

        // Mostra mensagem inicial
        lcdShowText("Pressione uma", 0, 0);
        lcdShowText("tecla", 1, 5);

        // Aguarda uma tecla
        const key = keypadWaitForKey(0);

        // Limpa e mostra a tecla
        lcdClear();
        lcdShowText("Tecla:", 0, 0);
        lcdShowText(key, 1, 6);

        // Mostra caracteres especiais
        basic.pause(2000);
        lcdClear();
        lcdShowText("Caracteres:", 0, 0);
        lcdShowSpecialChar(CustomChar.Heart, 1, 0);
        lcdShowSpecialChar(CustomChar.Smile, 1, 2);
        lcdShowSpecialChar(CustomChar.Star, 1, 4);
        lcdShowSpecialChar(CustomChar.Square, 1, 6);
        lcdShowSpecialChar(CustomChar.MusicNote, 1, 8);
        lcdShowSpecialChar(CustomChar.DoubleHeart, 1, 10);

        // Exemplo de rolagem
        basic.pause(3000);
        lcdClear();
        lcdScrollText("Texto com rolagem no LCD 16x2!", 0, 250);

        // Exemplo de caracteres personalizados
        basic.pause(2000);
        lcdClear();
        lcdShowText("Criando chars", 0, 0);

        // Cria um caractere personalizado (um quadrado com borda)
        const customPattern = [0x1F, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1F];
        lcdCreateChar(1, customPattern);
        lcdShowCustomChar(1, 1, 0);

        // Cria outro caractere (uma seta para baixo)
        const arrowDown = [0x00, 0x04, 0x04, 0x04, 0x04, 0x0E, 0x1F, 0x00];
        lcdCreateChar(2, arrowDown);
        lcdShowCustomChar(2, 1, 2);

        lcdShowText("Custom", 1, 4);
    }

    /**
     * Exemplo simples - Display de teclas
     * Mostra as teclas pressionadas no LCD
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_key_display" block="Exemplo: Display de teclas no LCD"
    //% weight=2
    export function exampleKeyDisplay(): void {
        // Inicializa os dispositivos
        lcdInit(LCD_ADDR);
        keypadInit(KEYPAD_ADDR);

        lcdClear();
        lcdShowText("Teclas:", 0, 0);

        let lastKey = "";

        while (true) {
            const key = keypadReadKey(KEYPAD_ADDR);
            if (key !== "" && key !== lastKey) {
                lastKey = key;
                lcdShowText(key + "     ", 1, 0);

                // Se for número, mostra o valor numérico
                const num = keypadKeyToNumber(key);
                if (num >= 0) {
                    lcdShowText("Num:" + num + " ", 1, 8);
                }
            }
            basic.pause(100);
        }
    }

    /**
     * Exemplo - Menu com teclado
     * Navegação de menu usando as teclas direcionais
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_menu" block="Exemplo: Menu com teclado"
    //% weight=3
    export function exampleMenu(): void {
        // Inicializa os dispositivos
        lcdInit(LCD_ADDR);
        keypadInit(KEYPAD_ADDR);

        const menuItems = ["Opção 1", "Opção 2", "Opção 3", "Opção 4"];
        let selected = 0;

        function showMenu(): void {
            lcdClear();
            lcdShowText("MENU", 0, 6);
            lcdShowText(">", 1, 0);
            lcdShowText(menuItems[selected], 1, 2);
        }

        showMenu();

        while (true) {
            const key = keypadReadKey(KEYPAD_ADDR);

            if (key === "A") { // Tecla A = Sair
                break;
            } else if (key === "B") { // Tecla B = Selecionar
                lcdClear();
                lcdShowText("Selecionado:", 0, 0);
                lcdShowText(menuItems[selected], 1, 0);
                basic.pause(2000);
                showMenu();
            } else if (key === "C") { // Tecla C = Próximo
                selected = (selected + 1) % menuItems.length;
                showMenu();
            } else if (key === "D") { // Tecla D = Anterior
                selected = (selected - 1 + menuItems.length) % menuItems.length;
                showMenu();
            }

            basic.pause(100);
        }

        lcdClear();
        lcdShowText("Menu fechado", 0, 0);
    }
}