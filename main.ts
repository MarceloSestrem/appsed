// Extensão completa para micro:bit V2 com:
// - LCD 16x2 I2C (0x27)
// - Teclado 4x4 (0x20)
// - Robotbit (Motores DC, Servos)
// - Sensores (Ultrassônico, Umidade, Temperatura, LDR, etc.)
// namespace: appsSed

//% color="#0078d7" icon="\uf120" weight=100
namespace appsSed {
    // ==================== CONSTANTES ====================

    // LCD
    const LCD_CLEAR = 0x01;
    const LCD_HOME = 0x02;
    const LCD_ENTRY_MODE = 0x04;
    const LCD_ENTRY_INC = 0x02;
    const LCD_ENTRY_SHIFT = 0x01;
    const LCD_ON = 0x08;
    const LCD_ON_DISPLAY = 0x04;
    const LCD_ON_CURSOR = 0x02;
    const LCD_ON_BLINK = 0x01;
    const LCD_FUNCTION = 0x20;
    const LCD_FUNCTION_8BIT = 0x10;
    const LCD_FUNCTION_2LINE = 0x08;
    const LCD_BACKLIGHT = 0x08;
    const LCD_NOBACKLIGHT = 0x00;
    const LCD_ENABLE_BIT = 0x04;
    const LCD_CMD = 0x00;
    const LCD_CHR = 0x01;

    // Endereços padrão
    const LCD_ADDR = 0x27;
    const KEYPAD_ADDR = 0x20;

    // Robotbit
    const ROBOTBIT_ADDR = 0x10;
    const MOTOR_A = 0x00;
    const MOTOR_B = 0x02;
    const MOTOR_A_PWM = 0x01;
    const MOTOR_B_PWM = 0x03;

    // Pinos dos sensores
    const ULTRASONIC_TRIG = DigitalPin.P1;
    const ULTRASONIC_ECHO = DigitalPin.P2;
    const LDR_PIN = AnalogPin.P0;
    const SOIL_MOISTURE_PIN = AnalogPin.P1;
    const TEMP_SENSOR_PIN = AnalogPin.P2;

    let lcdInitialized = false;
    let backlightState = true;
    let robotbitInitialized = false;

    // Matriz do teclado 4x4
    const KEYPAD_KEYS = [
        ['1', '2', '3', 'A'],
        ['4', '5', '6', 'B'],
        ['7', '8', '9', 'C'],
        ['*', '0', '#', 'D']
    ];

    // ==================== ENUMS ====================

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

    // Direções dos motores
    export enum MotorDirection {
        //% block="Frente"
        Forward,
        //% block="Trás"
        Backward,
        //% block="Parar"
        Stop,
        //% block="Esquerda"
        Left,
        //% block="Direita"
        Right
    }

    // Motores DC
    export enum Motor {
        //% block="Motor A"
        MotorA,
        //% block="Motor B"
        MotorB,
        //% block="Ambos"
        Both
    }

    // Servos
    export enum Servo {
        //% block="Servo 1"
        Servo1,
        //% block="Servo 2"
        Servo2,
        //% block="Servo 3"
        Servo3,
        //% block="Servo 4"
        Servo4,
        //% block="Servo 5"
        Servo5,
        //% block="Servo 6"
        Servo6,
        //% block="Servo 7"
        Servo7,
        //% block="Servo 8"
        Servo8
    }

    // Sensores
    export enum Sensor {
        //% block="Umidade do Solo"
        SoilMoisture,
        //% block="Temperatura (LM35)"
        Temperature,
        //% block="Luminosidade (LDR)"
        Light,
        //% block="Som (Microfone)"
        Sound,
        //% block="Distância (Ultrassônico)"
        Ultrasonic
    }

    // ==================== LCD ====================

    /**
     * Inicializa o LCD 16x2
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_init" block="LCD Inicializar endereço %addr"
    //% addr.defl=0x27
    //% weight=100
    export function lcdInit(addr: number = 0x27): void {
        if (lcdInitialized) return;

        pins.i2cWriteNumber(addr, 0x30, NumberFormat.UInt8BE);
        basic.pause(5);
        pins.i2cWriteNumber(addr, 0x30, NumberFormat.UInt8BE);
        basic.pause(5);
        pins.i2cWriteNumber(addr, 0x30, NumberFormat.UInt8BE);
        basic.pause(1);
        pins.i2cWriteNumber(addr, 0x20, NumberFormat.UInt8BE);
        basic.pause(1);

        lcdCommand(0x28, addr);
        lcdCommand(0x08, addr);
        lcdCommand(0x01, addr);
        lcdCommand(0x06, addr);
        lcdCommand(0x0C, addr);

        backlightState = true;
        lcdInitialized = true;
    }

    function lcdCommand(cmd: number, addr: number): void {
        const high = (cmd & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT);
        const low = ((cmd << 4) & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT);
        write4Bits(high, addr, LCD_CMD);
        write4Bits(low, addr, LCD_CMD);
    }

    function lcdData(data: number, addr: number): void {
        const high = (data & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT) | 0x01;
        const low = ((data << 4) & 0xF0) | (backlightState ? LCD_BACKLIGHT : LCD_NOBACKLIGHT) | 0x01;
        write4Bits(high, addr, LCD_CHR);
        write4Bits(low, addr, LCD_CHR);
    }

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
    //% blockId="appssed_lcd_clear" block="LCD Limpar display"
    //% weight=99
    export function lcdClear(): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
        lcdCommand(LCD_CLEAR, LCD_ADDR);
        basic.pause(2);
    }

    /**
     * Posiciona o cursor no LCD
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
     * Exibe texto no LCD
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
     * Cria caractere personalizado
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
     * Exibe caractere personalizado
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
     * Exibe caractere especial
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

    function getSpecialCharPattern(char: CustomChar): number[] {
        switch (char) {
            case CustomChar.Heart: return [0x00, 0x0A, 0x1F, 0x1F, 0x1F, 0x0E, 0x04, 0x00];
            case CustomChar.ArrowRight: return [0x00, 0x04, 0x0C, 0x1C, 0x1C, 0x0C, 0x04, 0x00];
            case CustomChar.ArrowLeft: return [0x00, 0x04, 0x06, 0x07, 0x07, 0x06, 0x04, 0x00];
            case CustomChar.Smile: return [0x00, 0x00, 0x0A, 0x00, 0x11, 0x0E, 0x00, 0x00];
            case CustomChar.Square: return [0x00, 0x1F, 0x11, 0x11, 0x11, 0x11, 0x1F, 0x00];
            case CustomChar.Circle: return [0x00, 0x0E, 0x11, 0x11, 0x11, 0x11, 0x0E, 0x00];
            case CustomChar.Triangle: return [0x00, 0x04, 0x0E, 0x1F, 0x00, 0x00, 0x00, 0x00];
            case CustomChar.Star: return [0x00, 0x04, 0x0A, 0x1F, 0x04, 0x0A, 0x11, 0x00];
            case CustomChar.MusicNote: return [0x00, 0x06, 0x0A, 0x0A, 0x16, 0x12, 0x0E, 0x00];
            case CustomChar.DoubleHeart: return [0x00, 0x0A, 0x1F, 0x1F, 0x0A, 0x1F, 0x1F, 0x0A];
            default: return [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        }
    }

    /**
     * Controla backlight do LCD
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
     * Exibe texto com rolagem
     */
    //% subcategory="LCD"
    //% blockId="appssed_lcd_scroll_text" block="LCD Exibir com rolagem %text|na linha %row|velocidade %speed ms"
    //% row.min=0 row.max=1
    //% speed.min=100 speed.max=1000
    //% weight=92
    export function lcdScrollText(text: string, row: number = 0, speed: number = 300): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);
        const paddedText = text + "     ";
        for (let i = 0; i < paddedText.length - 15; i++) {
            lcdSetCursor(row, 0);
            lcdShowText(paddedText.substr(i, 16), row, 0);
            basic.pause(speed);
        }
    }

    // ==================== TECLADO 4x4 ====================

    /**
     * Inicializa o teclado 4x4
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_init" block="Teclado Inicializar endereço %addr"
    //% addr.defl=0x20
    //% weight=80
    export function keypadInit(addr: number = 0x20): void {
        pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
        basic.pause(10);
    }

    /**
     * Lê uma tecla do teclado
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_read" block="Teclado Ler tecla"
    //% weight=79
    export function keypadReadKey(addr: number = 0x20): string {
        for (let col = 0; col < 4; col++) {
            let output = 0xFF;
            output &= ~(1 << (col + 4));
            pins.i2cWriteNumber(addr, output, NumberFormat.UInt8BE);
            basic.pause(1);

            const input = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);

            for (let row = 0; row < 4; row++) {
                if ((input & (1 << row)) === 0) {
                    pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
                    return KEYPAD_KEYS[row][col];
                }
            }

            pins.i2cWriteNumber(addr, 0xFF, NumberFormat.UInt8BE);
            basic.pause(1);
        }
        return "";
    }

    /**
     * Aguarda uma tecla ser pressionada
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_wait" block="Teclado Aguardar tecla %timeout ms"
    //% weight=78
    export function keypadWaitForKey(timeout: number = 0, addr: number = 0x20): string {
        const start = control.millis();
        while (timeout === 0 || control.millis() - start < timeout) {
            const key = keypadReadKey(addr);
            if (key !== "") return key;
            basic.pause(10);
        }
        return "";
    }

    /**
     * Verifica se uma tecla está pressionada
     */
    //% subcategory="Teclado"
    //% blockId="appssed_keypad_is_pressed" block="Teclado Tecla %key está pressionada"
    //% weight=77
    export function keypadIsKeyPressed(key: string, addr: number = 0x20): boolean {
        return keypadReadKey(addr) === key;
    }

    // ==================== ROBOTBIT - MOTORES ====================

    /**
     * Inicializa o Robotbit
     */
    //% subcategory="Robotbit"
    //% blockId="appssed_robotbit_init" block="Robotbit Inicializar"
    //% weight=70
    export function robotbitInit(): void {
        if (!robotbitInitialized) {
            pins.i2cWriteNumber(ROBOTBIT_ADDR, 0x00, NumberFormat.UInt8BE);
            robotbitInitialized = true;
        }
    }

    /**
     * Controla motor DC do Robotbit
     */
    //% subcategory="Robotbit"
    //% blockId="appssed_robotbit_motor" block="Robotbit Motor %motor|%direction|velocidade %speed %"
    //% speed.min=0 speed.max=100
    //% weight=69
    export function robotbitMotor(motor: Motor, direction: MotorDirection, speed: number = 50): void {
        robotbitInit();

        const pwmSpeed = Math.map(speed, 0, 100, 0, 255);

        if (motor === Motor.MotorA || motor === Motor.Both) {
            controlMotor(MOTOR_A, direction, pwmSpeed);
        }
        if (motor === Motor.MotorB || motor === Motor.Both) {
            controlMotor(MOTOR_B, direction, pwmSpeed);
        }
    }

    function controlMotor(motor: number, direction: MotorDirection, speed: number): void {
        const motorReg = motor === MOTOR_A ? 0x00 : 0x02;
        const pwmReg = motor === MOTOR_A ? 0x01 : 0x03;

        switch (direction) {
            case MotorDirection.Forward:
                pins.i2cWriteNumber(ROBOTBIT_ADDR, motorReg, NumberFormat.UInt8BE);
                pins.i2cWriteNumber(ROBOTBIT_ADDR, pwmReg, NumberFormat.UInt8BE);
                pins.i2cWriteNumber(ROBOTBIT_ADDR, speed, NumberFormat.UInt8BE);
                break;
            case MotorDirection.Backward:
                pins.i2cWriteNumber(ROBOTBIT_ADDR, motorReg | 0x01, NumberFormat.UInt8BE);
                pins.i2cWriteNumber(ROBOTBIT_ADDR, pwmReg, NumberFormat.UInt8BE);
                pins.i2cWriteNumber(ROBOTBIT_ADDR, speed, NumberFormat.UInt8BE);
                break;
            case MotorDirection.Stop:
                pins.i2cWriteNumber(ROBOTBIT_ADDR, motorReg, NumberFormat.UInt8BE);
                pins.i2cWriteNumber(ROBOTBIT_ADDR, pwmReg, NumberFormat.UInt8BE);
                pins.i2cWriteNumber(ROBOTBIT_ADDR, 0x00, NumberFormat.UInt8BE);
                break;
            case MotorDirection.Left:
                // Gira à esquerda (motor A para trás, motor B para frente)
                if (motor === MOTOR_A) {
                    controlMotor(MOTOR_A, MotorDirection.Backward, speed);
                } else if (motor === MOTOR_B) {
                    controlMotor(MOTOR_B, MotorDirection.Forward, speed);
                }
                break;
            case MotorDirection.Right:
                // Gira à direita (motor A para frente, motor B para trás)
                if (motor === MOTOR_A) {
                    controlMotor(MOTOR_A, MotorDirection.Forward, speed);
                } else if (motor === MOTOR_B) {
                    controlMotor(MOTOR_B, MotorDirection.Backward, speed);
                }
                break;
        }
    }

    /**
     * Controla o robô completo (2 motores)
     */
    //% subcategory="Robotbit"
    //% blockId="appssed_robotbit_drive" block="Robotbit Dirigir %direction|velocidade %speed %"
    //% speed.min=0 speed.max=100
    //% weight=68
    export function robotbitDrive(direction: MotorDirection, speed: number = 50): void {
        robotbitInit();

        switch (direction) {
            case MotorDirection.Forward:
                robotbitMotor(Motor.Both, MotorDirection.Forward, speed);
                break;
            case MotorDirection.Backward:
                robotbitMotor(Motor.Both, MotorDirection.Backward, speed);
                break;
            case MotorDirection.Left:
                robotbitMotor(Motor.MotorA, MotorDirection.Backward, speed);
                robotbitMotor(Motor.MotorB, MotorDirection.Forward, speed);
                break;
            case MotorDirection.Right:
                robotbitMotor(Motor.MotorA, MotorDirection.Forward, speed);
                robotbitMotor(Motor.MotorB, MotorDirection.Backward, speed);
                break;
            case MotorDirection.Stop:
                robotbitMotor(Motor.Both, MotorDirection.Stop, 0);
                break;
        }
    }

    // ==================== ROBOTBIT - SERVOS ====================

    /**
     * Controla servo do Robotbit
     */
    //% subcategory="Robotbit"
    //% blockId="appssed_robotbit_servo" block="Robotbit Servo %servo|ângulo %angle °"
    //% angle.min=0 angle.max=180
    //% weight=67
    export function robotbitServo(servo: Servo, angle: number): void {
        robotbitInit();

        const servoMap = [
            0x08, 0x09, 0x0A, 0x0B,  // Servos 1-4
            0x0C, 0x0D, 0x0E, 0x0F   // Servos 5-8
        ];

        const reg = servoMap[servo];
        if (reg !== undefined) {
            // Converte ângulo para valor PWM (0-180 -> 500-2500 us)
            const pulse = Math.map(angle, 0, 180, 500, 2500);
            const highByte = (pulse >> 8) & 0xFF;
            const lowByte = pulse & 0xFF;

            pins.i2cWriteNumber(ROBOTBIT_ADDR, reg, NumberFormat.UInt8BE);
            pins.i2cWriteNumber(ROBOTBIT_ADDR, highByte, NumberFormat.UInt8BE);
            pins.i2cWriteNumber(ROBOTBIT_ADDR, lowByte, NumberFormat.UInt8BE);
        }
    }

    /**
     * Controla múltiplos servos simultaneamente
     */
    //% subcategory="Robotbit"
    //% blockId="appssed_robotbit_servos" block="Robotbit Servos %servo1:%angle1°|%servo2:%angle2°|%servo3:%angle3°|%servo4:%angle4°"
    //% angle1.min=0 angle1.max=180
    //% angle2.min=0 angle2.max=180
    //% angle3.min=0 angle3.max=180
    //% angle4.min=0 angle4.max=180
    //% weight=66
    export function robotbitServos(
        servo1: Servo, angle1: number,
        servo2: Servo, angle2: number,
        servo3: Servo, angle3: number,
        servo4: Servo, angle4: number
    ): void {
        robotbitServo(servo1, angle1);
        robotbitServo(servo2, angle2);
        robotbitServo(servo3, angle3);
        robotbitServo(servo4, angle4);
    }

    // ==================== SENSORES ====================

    /**
     * Lê sensor ultrassônico HC-SR04
     * @returns Distância em cm
     */
    //% subcategory="Sensores"
    //% blockId="appssed_ultrasonic_read" block="Sensor Ultrassônico ler distância"
    //% weight=60
    export function ultrasonicRead(): number {
        // Envia pulso de trigger
        pins.digitalWritePin(ULTRASONIC_TRIG, 0);
        control.waitMicros(2);
        pins.digitalWritePin(ULTRASONIC_TRIG, 1);
        control.waitMicros(10);
        pins.digitalWritePin(ULTRASONIC_TRIG, 0);

        // Lê o eco
        const duration = pins.pulseIn(ULTRASONIC_ECHO, PulseValue.High, 30000);

        if (duration > 0) {
            // Velocidade do som = 343 m/s = 0.0343 cm/us
            // Distância = (tempo * velocidade) / 2
            return Math.floor(duration * 0.0343 / 2);
        }
        return -1;
    }

    /**
     * Lê sensor de umidade do solo
     * @returns Valor 0-1023 (seco = alto, úmido = baixo)
     */
    //% subcategory="Sensores"
    //% blockId="appssed_soil_read" block="Sensor Umidade do Solo ler"
    //% weight=59
    export function soilMoistureRead(): number {
        return pins.analogReadPin(SOIL_MOISTURE_PIN);
    }

    /**
     * Lê sensor de temperatura LM35
     * @returns Temperatura em °C
     */
    //% subcategory="Sensores"
    //% blockId="appssed_temp_read" block="Sensor Temperatura LM35 ler"
    //% weight=58
    export function temperatureRead(): number {
        const reading = pins.analogReadPin(TEMP_SENSOR_PIN);
        // LM35: 10mV/°C, micro:bit ADC 0-1023 = 0-3.3V
        const voltage = (reading / 1023) * 3300; // mV
        return Math.round(voltage / 10);
    }

    /**
     * Lê sensor de luminosidade LDR
     * @returns Valor 0-1023 (claro = alto, escuro = baixo)
     */
    //% subcategory="Sensores"
    //% blockId="appssed_ldr_read" block="Sensor Luminosidade LDR ler"
    //% weight=57
    export function ldrRead(): number {
        return pins.analogReadPin(LDR_PIN);
    }

    /**
     * Lê sensor de som (microfone)
     * @returns Valor 0-1023
     */
    //% subcategory="Sensores"
    //% blockId="appssed_sound_read" block="Sensor Som ler"
    //% weight=56
    export function soundRead(): number {
        return pins.analogReadPin(AnalogPin.P3);
    }

    /**
     * Lê qualquer sensor analógico
     */
    //% subcategory="Sensores"
    //% blockId="appssed_sensor_read" block="Sensor %sensor ler"
    //% weight=55
    export function sensorRead(sensor: Sensor): number {
        switch (sensor) {
            case Sensor.SoilMoisture:
                return soilMoistureRead();
            case Sensor.Temperature:
                return temperatureRead();
            case Sensor.Light:
                return ldrRead();
            case Sensor.Sound:
                return soundRead();
            case Sensor.Ultrasonic:
                return ultrasonicRead();
            default:
                return 0;
        }
    }

    /**
     * Exibe leitura de sensor no LCD
     */
    //% subcategory="Sensores"
    //% blockId="appssed_sensor_show" block="Sensor %sensor|exibir no LCD linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=54
    export function sensorShowOnLCD(sensor: Sensor, row: number = 0, col: number = 0): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);

        const value = sensorRead(sensor);
        let label = "";
        let unit = "";

        switch (sensor) {
            case Sensor.SoilMoisture:
                label = "Umidade:";
                unit = "";
                break;
            case Sensor.Temperature:
                label = "Temp:";
                unit = "°C";
                break;
            case Sensor.Light:
                label = "Luz:";
                unit = "";
                break;
            case Sensor.Sound:
                label = "Som:";
                unit = "";
                break;
            case Sensor.Ultrasonic:
                label = "Dist:";
                unit = "cm";
                break;
        }

        lcdSetCursor(row, col);
        lcdShowText(label + value + unit, row, col);
    }

    // ==================== EXEMPLOS ====================

    /**
     * Exemplo: Robô seguidor de linha (simulado com sensores)
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_line_follower" block="Exemplo: Robô seguidor de linha"
    //% weight=10
    export function exampleLineFollower(): void {
        lcdInit(LCD_ADDR);
        robotbitInit();

        lcdClear();
        lcdShowText("Seguidor Linha", 0, 0);
        lcdShowText("Iniciando...", 1, 0);
        basic.pause(2000);

        while (true) {
            // Simula leitura de sensores de linha (usando LDR)
            const leftSensor = ldrRead();
            const rightSensor = ldrRead();

            // Se ambos os sensores detectarem linha (escuro)
            if (leftSensor < 300 && rightSensor < 300) {
                robotbitDrive(MotorDirection.Forward, 50);
                lcdShowText("Frente   ", 1, 0);
            }
            // Se apenas o sensor esquerdo detectar linha
            else if (leftSensor < 300) {
                robotbitDrive(MotorDirection.Left, 50);
                lcdShowText("Esquerda ", 1, 0);
            }
            // Se apenas o sensor direito detectar linha
            else if (rightSensor < 300) {
                robotbitDrive(MotorDirection.Right, 50);
                lcdShowText("Direita  ", 1, 0);
            }
            // Se nenhum sensor detectar linha
            else {
                robotbitDrive(MotorDirection.Stop, 0);
                lcdShowText("Parado   ", 1, 0);
            }

            basic.pause(50);
        }
    }

    /**
     * Exemplo: Estação meteorológica
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_weather" block="Exemplo: Estação Meteorológica"
    //% weight=9
    export function exampleWeatherStation(): void {
        lcdInit(LCD_ADDR);

        lcdClear();
        lcdShowText("Estação Meteo", 0, 0);
        basic.pause(2000);

        while (true) {
            lcdClear();

            // Temperatura
            const temp = temperatureRead();
            lcdShowText("Temp: " + temp + "°C", 0, 0);

            // Umidade do solo
            const soil = soilMoistureRead();
            let soilStatus = "Seca";
            if (soil < 300) soilStatus = "Molhada";
            else if (soil < 600) soilStatus = "Úmida";
            lcdShowText("Solo: " + soilStatus, 1, 0);

            // Exibe indicador de luminosidade
            const light = ldrRead();
            if (light > 800) {
                lcdShowSpecialChar(CustomChar.Star, 1, 13);
            } else {
                lcdShowText("  ", 1, 13);
            }

            basic.pause(2000);
        }
    }

    /**
     * Exemplo: Controle de servo com teclado
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_servo_control" block="Exemplo: Controle de Servo com Teclado"
    //% weight=8
    export function exampleServoControl(): void {
        lcdInit(LCD_ADDR);
        keypadInit(KEYPAD_ADDR);
        robotbitInit();

        let angle = 90;
        lcdClear();
        lcdShowText("Servo Control", 0, 0);
        lcdShowText("A:+ D:-", 1, 0);
        basic.pause(2000);

        while (true) {
            lcdClear();
            lcdShowText("Ângulo: " + angle + "°", 0, 0);
            lcdShowText("1-8: Servos", 1, 0);

            const key = keypadWaitForKey(100);

            if (key === "A") {
                angle = Math.min(180, angle + 5);
                robotbitServo(Servo.Servo1, angle);
            } else if (key === "D") {
                angle = Math.max(0, angle - 5);
                robotbitServo(Servo.Servo1, angle);
            } else if (key === "1") {
                robotbitServo(Servo.Servo1, angle);
            } else if (key === "2") {
                robotbitServo(Servo.Servo2, angle);
            } else if (key === "3") {
                robotbitServo(Servo.Servo3, angle);
            } else if (key === "4") {
                robotbitServo(Servo.Servo4, angle);
            } else if (key === "5") {
                robotbitServo(Servo.Servo5, angle);
            } else if (key === "6") {
                robotbitServo(Servo.Servo6, angle);
            } else if (key === "7") {
                robotbitServo(Servo.Servo7, angle);
            } else if (key === "8") {
                robotbitServo(Servo.Servo8, angle);
            }

            basic.pause(50);
        }
    }

    /**
     * Exemplo: Carro com controle remoto via teclado
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_rc_car" block="Exemplo: Carro RC com Teclado"
    //% weight=7
    export function exampleRCCar(): void {
        lcdInit(LCD_ADDR);
        keypadInit(KEYPAD_ADDR);
        robotbitInit();

        lcdClear();
        lcdShowText("Carro RC", 0, 6);
        lcdShowText("Teclas 2,4,6,8", 1, 0);
        basic.pause(2000);

        let speed = 50;

        while (true) {
            const key = keypadReadKey();

            if (key === "8") {
                robotbitDrive(MotorDirection.Forward, speed);
                lcdShowText("Frente  ", 1, 0);
            } else if (key === "2") {
                robotbitDrive(MotorDirection.Backward, speed);
                lcdShowText("Trás    ", 1, 0);
            } else if (key === "4") {
                robotbitDrive(MotorDirection.Left, speed);
                lcdShowText("Esquerda", 1, 0);
            } else if (key === "6") {
                robotbitDrive(MotorDirection.Right, speed);
                lcdShowText("Direita ", 1, 0);
            } else if (key === "5") {
                robotbitDrive(MotorDirection.Stop, 0);
                lcdShowText("Parado  ", 1, 0);
            } else if (key === "A") {
                speed = Math.min(100, speed + 10);
                lcdShowText("Vel: " + speed + "%", 1, 0);
            } else if (key === "B") {
                speed = Math.max(0, speed - 10);
                lcdShowText("Vel: " + speed + "%", 1, 0);
            }

            basic.pause(50);
        }
    }

    /**
     * Exemplo: Monitor de sensores no LCD
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_sensor_monitor" block="Exemplo: Monitor de Sensores"
    //% weight=6
    export function exampleSensorMonitor(): void {
        lcdInit(LCD_ADDR);

        lcdClear();
        lcdShowText("Sensores:", 0, 0);

        while (true) {
            // Linha 0: Temperatura e Luminosidade
            const temp = temperatureRead();
            const light = ldrRead();
            lcdSetCursor(1, 0);
            lcdShowText("T:" + temp + "°C L:" + light + " ", 1, 0);

            // Mostra indicador visual
            if (temp > 30) {
                lcdShowSpecialChar(CustomChar.Heart, 1, 12);
            } else {
                lcdShowText(" ", 1, 12);
            }

            // Verifica tecla para mudar de modo
            const key = keypadReadKey();
            if (key === "A") {
                // Modo ultrassônico
                const dist = ultrasonicRead();
                lcdClear();
                lcdShowText("Distância:", 0, 0);
                lcdShowText(dist + " cm", 1, 0);
                basic.pause(3000);
                lcdClear();
                lcdShowText("Sensores:", 0, 0);
            }

            basic.pause(500);
        }
    }

    // ==================== UTILITÁRIOS ====================

    /**
     * Mapeia um valor de um intervalo para outro
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_map" block="Mapear %value|de %fromLow-%fromHigh|para %toLow-%toHigh"
    //% weight=50
    export function mapValue(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        return Math.map(value, fromLow, fromHigh, toLow, toHigh);
    }

    /**
     * Converte ângulo para PWM
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_angle_to_pwm" block="Ângulo %angle°|para PWM"
    //% angle.min=0 angle.max=180
    //% weight=49
    export function angleToPWM(angle: number): number {
        return Math.map(angle, 0, 180, 500, 2500);
    }

    /**
     * Converte PWM para ângulo
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_pwm_to_angle" block="PWM %pwm|para Ângulo"
    //% pwm.min=500 pwm.max=2500
    //% weight=48
    export function pwmToAngle(pwm: number): number {
        return Math.map(pwm, 500, 2500, 0, 180);
    }

    /**
     * Limita um valor entre mínimo e máximo
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_clamp" block="Limitar %value|entre %min e %max"
    //% weight=47
    export function clampValue(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}