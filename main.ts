// Extensão completa para micro:bit V2 - COM SELEÇÃO DE PINOS
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

    // RFID RC532
    const RFID_ADDR = 0x28;
    const RFID_PICC_REQIDL = 0x26;
    const RFID_PICC_ANTICOLL = 0x93;

    // Pinos padrão dos sensores
    const DEFAULT_ULTRASONIC_TRIG = DigitalPin.P1;
    const DEFAULT_ULTRASONIC_ECHO = DigitalPin.P2;
    const DEFAULT_LDR_PIN = AnalogPin.P0;
    const DEFAULT_SOIL_MOISTURE_PIN = AnalogPin.P1;
    const DEFAULT_TEMP_SENSOR_PIN = AnalogPin.P2;
    const DEFAULT_DHT11_PIN = DigitalPin.P3;
    const DEFAULT_IR_RECEIVER_PIN = DigitalPin.P4;
    const DEFAULT_RGB_LED_PIN = DigitalPin.P5;
    const DEFAULT_BUZZER_PIN = DigitalPin.P6;

    let lcdInitialized = false;
    let backlightState = true;
    let robotbitInitialized = false;
    let rfidInitialized = false;

    // Matriz do teclado 4x4
    const KEYPAD_KEYS = [
        ['1', '2', '3', 'A'],
        ['4', '5', '6', 'B'],
        ['7', '8', '9', 'C'],
        ['*', '0', '#', 'D']
    ];

    // ==================== ENUMS ====================

    export enum CustomChar {
        Heart, ArrowRight, ArrowLeft, Smile, Square,
        Circle, Triangle, Star, MusicNote, DoubleHeart
    }

    export enum MotorDirection {
        Forward, Backward, Stop, Left, Right
    }

    export enum Motor {
        MotorA, MotorB, Both
    }

    export enum Servo {
        Servo1, Servo2, Servo3, Servo4, Servo5, Servo6, Servo7, Servo8
    }

    export enum Sensor {
        SoilMoisture, Temperature, Light, Sound, Ultrasonic, DHT11
    }

    export enum LEDColor {
        Red, Green, Blue, Yellow, Cyan, Magenta, White, Orange, Purple, Off
    }

    export enum IRKey {
        Power, VolumeUp, VolumeDown, ChannelUp, ChannelDown,
        Mute, Num0, Num1, Num2, Num3, Num4, Num5, Num6, Num7, Num8, Num9,
        OK, Up, Down, Left, Right
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

    // ==================== ROBOTBIT ====================

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
            default:
                break;
        }
    }

    /**
     * Controla o robô completo
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

    /**
     * Controla servo do Robotbit
     */
    //% subcategory="Robotbit"
    //% blockId="appssed_robotbit_servo" block="Robotbit Servo %servo|ângulo %angle °"
    //% angle.min=0 angle.max=180
    //% weight=67
    export function robotbitServo(servo: Servo, angle: number): void {
        robotbitInit();

        const servoMap = [0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F];
        const reg = servoMap[servo];

        if (reg !== undefined) {
            const pulse = Math.map(angle, 0, 180, 500, 2500);
            const highByte = (pulse >> 8) & 0xFF;
            const lowByte = pulse & 0xFF;

            pins.i2cWriteNumber(ROBOTBIT_ADDR, reg, NumberFormat.UInt8BE);
            pins.i2cWriteNumber(ROBOTBIT_ADDR, highByte, NumberFormat.UInt8BE);
            pins.i2cWriteNumber(ROBOTBIT_ADDR, lowByte, NumberFormat.UInt8BE);
        }
    }

    // ==================== SENSORES COM SELEÇÃO DE PINOS ====================

    /**
     * Lê sensor ultrassônico HC-SR04 com pinos configuráveis
     * @param trig Pino de trigger
     * @param echo Pino de echo
     * @returns Distância em cm
     */
    //% subcategory="Sensores"
    //% blockId="appssed_ultrasonic_read" block="Sensor Ultrassônico ler distância |trigger %trig|echo %echo"
    //% weight=65
    export function ultrasonicRead(trig: DigitalPin = DEFAULT_ULTRASONIC_TRIG, echo: DigitalPin = DEFAULT_ULTRASONIC_ECHO): number {
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        const duration = pins.pulseIn(echo, PulseValue.High, 30000);
        if (duration > 0) {
            return Math.floor(duration * 0.0343 / 2);
        }
        return -1;
    }

    /**
     * Lê sensor DHT11 com pino configurável
     * @param pin Pino do DHT11
     * @returns Array [temperatura, umidade]
     */
    //% subcategory="Sensores"
    //% blockId="appssed_dht11_read" block="Sensor DHT11 ler |pino %pin"
    //% weight=64
    export function dht11Read(pin: DigitalPin = DEFAULT_DHT11_PIN): number[] {
        let data: number[] = [0, 0, 0, 0, 0];
        let result: number[] = [0, 0];

        // Inicia comunicação
        pins.digitalWritePin(pin, 0);
        basic.pause(18);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(30);

        // Aguarda resposta
        let response = false;
        for (let i = 0; i < 100; i++) {
            if (pins.digitalReadPin(pin) === 0) {
                response = true;
                break;
            }
            control.waitMicros(10);
        }

        if (response) {
            while (pins.digitalReadPin(pin) === 0) { }
            while (pins.digitalReadPin(pin) === 1) { }

            for (let i = 0; i < 40; i++) {
                while (pins.digitalReadPin(pin) === 0) { }
                const startTime = control.micros();
                while (pins.digitalReadPin(pin) === 1) { }
                const duration = control.micros() - startTime;

                if (duration > 50) {
                    data[Math.floor(i / 8)] |= (1 << (7 - (i % 8)));
                }
            }

            const checksum = (data[0] + data[1] + data[2] + data[3]) & 0xFF;
            if (checksum === data[4]) {
                result[0] = data[2];
                result[1] = data[0];
            } else {
                result[0] = -1;
                result[1] = -1;
            }
        }

        return result;
    }

    /**
     * Lê temperatura do DHT11 com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_dht11_temp" block="Sensor DHT11 ler temperatura °C |pino %pin"
    //% weight=63
    export function dht11Temperature(pin: DigitalPin = DEFAULT_DHT11_PIN): number {
        const data = dht11Read(pin);
        return data[0];
    }

    /**
     * Lê umidade do DHT11 com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_dht11_humidity" block="Sensor DHT11 ler umidade % |pino %pin"
    //% weight=62
    export function dht11Humidity(pin: DigitalPin = DEFAULT_DHT11_PIN): number {
        const data = dht11Read(pin);
        return data[1];
    }

    /**
     * Lê sensor de umidade do solo com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_soil_read" block="Sensor Umidade do Solo ler |pino %pin"
    //% weight=61
    export function soilMoistureRead(pin: AnalogPin = DEFAULT_SOIL_MOISTURE_PIN): number {
        return pins.analogReadPin(pin);
    }

    /**
     * Lê sensor de temperatura LM35 com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_temp_read" block="Sensor Temperatura LM35 ler |pino %pin"
    //% weight=60
    export function temperatureRead(pin: AnalogPin = DEFAULT_TEMP_SENSOR_PIN): number {
        const reading = pins.analogReadPin(pin);
        const voltage = (reading / 1023) * 3300;
        return Math.round(voltage / 10);
    }

    /**
     * Lê sensor de luminosidade LDR com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_ldr_read" block="Sensor Luminosidade LDR ler |pino %pin"
    //% weight=59
    export function ldrRead(pin: AnalogPin = DEFAULT_LDR_PIN): number {
        return pins.analogReadPin(pin);
    }

    /**
     * Lê sensor de som com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_sound_read" block="Sensor Som ler |pino %pin"
    //% weight=58
    export function soundRead(pin: AnalogPin = AnalogPin.P3): number {
        return pins.analogReadPin(pin);
    }

    /**
     * Lê qualquer sensor analógico com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_analog_read" block="Ler pino analógico %pin"
    //% weight=57
    export function analogRead(pin: AnalogPin): number {
        return pins.analogReadPin(pin);
    }

    /**
     * Lê qualquer sensor digital com pino configurável
     */
    //% subcategory="Sensores"
    //% blockId="appssed_digital_read" block="Ler pino digital %pin"
    //% weight=56
    export function digitalRead(pin: DigitalPin): number {
        return pins.digitalReadPin(pin);
    }

    /**
     * Exibe leitura de sensor no LCD com pinos configuráveis
     */
    //% subcategory="Sensores"
    //% blockId="appssed_sensor_show" block="Exibir sensor no LCD |%sensor|pino %pin|linha %row coluna %col"
    //% row.min=0 row.max=1
    //% col.min=0 col.max=15
    //% weight=55
    export function sensorShowOnLCD(sensor: Sensor, pin: any, row: number = 0, col: number = 0): void {
        if (!lcdInitialized) lcdInit(LCD_ADDR);

        let value = 0;
        let label = "";
        let unit = "";

        switch (sensor) {
            case Sensor.SoilMoisture:
                value = soilMoistureRead(pin as AnalogPin);
                label = "Solo:";
                unit = "";
                break;
            case Sensor.Temperature:
                value = temperatureRead(pin as AnalogPin);
                label = "Temp:";
                unit = "°C";
                break;
            case Sensor.Light:
                value = ldrRead(pin as AnalogPin);
                label = "Luz:";
                unit = "";
                break;
            case Sensor.Sound:
                value = soundRead(pin as AnalogPin);
                label = "Som:";
                unit = "";
                break;
            case Sensor.Ultrasonic:
                value = ultrasonicRead(pin as DigitalPin, pin as DigitalPin);
                label = "Dist:";
                unit = "cm";
                break;
            case Sensor.DHT11:
                value = dht11Temperature(pin as DigitalPin);
                label = "DHT:";
                unit = "°C";
                break;
        }

        lcdSetCursor(row, col);
        const displayText = label + value + unit;
        lcdShowText(displayText, row, col);
    }

    // ==================== RFID RC532 ====================
    // ==================== RFID RC532 ====================

    /**
     * Inicializa o RFID RC532
     */
    //% subcategory="RFID"
    //% blockId="appssed_rfid_init" block="RFID Inicializar"
    //% weight=50
    export function rfidInit(): void {
        if (!rfidInitialized) {
            pins.i2cWriteNumber(RFID_ADDR, 0x00, NumberFormat.UInt8BE);
            pins.i2cWriteNumber(RFID_ADDR, 0x80, NumberFormat.UInt8BE);
            basic.pause(10);

            pins.i2cWriteNumber(RFID_ADDR, 0x01, NumberFormat.UInt8BE);
            pins.i2cWriteNumber(RFID_ADDR, 0x0E, NumberFormat.UInt8BE);
            basic.pause(10);

            rfidInitialized = true;
        }
    }

    /**
     * Lê o UID de um cartão RFID
     * CORRIGIDO: Tratamento correto dos bytes
     */
    //% subcategory="RFID"
    //% blockId="appssed_rfid_read" block="RFID Ler cartão"
    //% weight=49
    export function rfidReadCard(): string {
        rfidInit();

        // Envia comando para procurar cartão
        let buffer = pins.createBuffer(2);
        buffer[0] = RFID_PICC_REQIDL;
        buffer[1] = 0x00;
        pins.i2cWriteBuffer(RFID_ADDR, buffer);
        basic.pause(10);

        // Lê resposta
        const response = pins.i2cReadBuffer(RFID_ADDR, 2);

        if (response.length >= 2 && response[0] === 0x00 && response[1] === 0x00) {
            // Procura por cartão
            buffer = pins.createBuffer(2);
            buffer[0] = RFID_PICC_ANTICOLL;
            buffer[1] = 0x00;
            pins.i2cWriteBuffer(RFID_ADDR, buffer);
            basic.pause(10);

            // Lê o UID (5 bytes)
            const uidBuffer = pins.i2cReadBuffer(RFID_ADDR, 5);

            if (uidBuffer.length >= 5) {
                let uid = "";
                for (let i = 0; i < 4; i++) {
                    // CORRIGIDO: Garantir que é um número e converter para hexadecimal
                    const byteValue = uidBuffer[i + 1] & 0xFF;
                    let hex = byteValue.toString(16).toUpperCase();
                    if (hex.length === 1) {
                        hex = "0" + hex;
                    }
                    uid += hex;
                }
                return uid;
            }
        }

        return "";
    }

    /**
     * Verifica se um cartão está presente
     */
    //% subcategory="RFID"
    //% blockId="appssed_rfid_present" block="RFID Cartão presente?"
    //% weight=48
    export function rfidCardPresent(): boolean {
        return rfidReadCard() !== "";
    }

    /**
     * Aguarda um cartão RFID
     */
    //% subcategory="RFID"
    //% blockId="appssed_rfid_wait" block="RFID Aguardar cartão %timeout ms"
    //% weight=47
    export function rfidWaitForCard(timeout: number = 0): string {
        const start = control.millis();
        while (timeout === 0 || control.millis() - start < timeout) {
            const uid = rfidReadCard();
            if (uid !== "") return uid;
            basic.pause(100);
        }
        return "";
    }    // ==================== SENSOR IR ====================

    /**
     * Inicializa o sensor IR com pino configurável
     */
    //% subcategory="Infravermelho"
    //% blockId="appssed_ir_init" block="IR Inicializar |pino %pin"
    //% weight=45
    export function irInit(pin: DigitalPin = DEFAULT_IR_RECEIVER_PIN): void {
        pins.digitalWritePin(pin, 1);
    }

    /**
     * Lê código IR com pino configurável
     */
    //% subcategory="Infravermelho"
    //% blockId="appssed_ir_read" block="IR Ler código |pino %pin"
    //% weight=44
    export function irReadCode(pin: DigitalPin = DEFAULT_IR_RECEIVER_PIN): number {
        let pulseCount = 0;
        let code = 0;
        let startTime = control.micros();

        while (pins.digitalReadPin(pin) === 1) {
            if (control.micros() - startTime > 100000) return 0;
        }

        while (pulseCount < 32) {
            const highTime = measurePulse(pin, 0);
            const lowTime = measurePulse(pin, 1);

            if (highTime > 1000 && lowTime > 1000) {
                code = (code << 1) | 1;
            } else if (highTime > 1000 && lowTime < 1000) {
                code = (code << 1) | 0;
            } else {
                return 0;
            }
            pulseCount++;
        }

        return code;
    }

    function measurePulse(pin: DigitalPin, state: number): number {
        const start = control.micros();
        while (pins.digitalReadPin(pin) === state) {
            if (control.micros() - start > 5000) return 5000;
        }
        return control.micros() - start;
    }

    /**
     * Lê tecla IR com pino configurável
     */
    //% subcategory="Infravermelho"
    //% blockId="appssed_ir_read_key" block="IR Ler tecla |pino %pin"
    //% weight=43
    export function irReadKey(pin: DigitalPin = DEFAULT_IR_RECEIVER_PIN): IRKey {
        const code = irReadCode(pin);
        const keyMap: { [key: number]: IRKey } = {
            0x00FF: IRKey.Power,
            0x40BF: IRKey.VolumeUp,
            0xC03F: IRKey.VolumeDown,
            0x6897: IRKey.Num0,
            0x30CF: IRKey.Num1,
            0x18E7: IRKey.Num2,
            0x7A85: IRKey.Num3,
            0x10EF: IRKey.Num4,
            0x38C7: IRKey.Num5,
            0x5AA5: IRKey.Num6,
            0x42BD: IRKey.Num7,
            0x4AB5: IRKey.Num8,
            0x52AD: IRKey.Num9,
            0x02FD: IRKey.OK,
            0x9867: IRKey.Up,
            0xD827: IRKey.Down,
            0xE01F: IRKey.Left,
            0x609F: IRKey.Right
        };

        return keyMap[code] || IRKey.Power;
    }

    /**
     * Verifica se uma tecla IR foi pressionada
     */
    //% subcategory="Infravermelho"
    //% blockId="appssed_ir_is_pressed" block="IR Tecla %key pressionada? |pino %pin"
    //% weight=42
    export function irIsKeyPressed(key: IRKey, pin: DigitalPin = DEFAULT_IR_RECEIVER_PIN): boolean {
        return irReadKey(pin) === key;
    }

    // ==================== LEDs ====================

    /**
     * Acende um LED normal
     */
    //% subcategory="LEDs"
    //% blockId="appssed_led_on" block="LED no pino %pin|ligar %state"
    //% weight=40
    export function ledOn(pin: DigitalPin, state: boolean): void {
        pins.digitalWritePin(pin, state ? 1 : 0);
    }

    /**
     * Controla intensidade de um LED (PWM)
     */
    //% subcategory="LEDs"
    //% blockId="appssed_led_pwm" block="LED no pino %pin|intensidade %value %"
    //% value.min=0 value.max=100
    //% weight=39
    export function ledPWM(pin: DigitalPin, value: number): void {
        const pwmValue = Math.map(value, 0, 100, 0, 1023);
        pins.analogWritePin(pin, pwmValue);
    }

    /**
     * Pisca um LED
     */
    //% subcategory="LEDs"
    //% blockId="appssed_led_blink" block="LED no pino %pin|piscar %times vezes|velocidade %speed ms"
    //% weight=38
    export function ledBlink(pin: DigitalPin, times: number, speed: number = 500): void {
        for (let i = 0; i < times; i++) {
            pins.digitalWritePin(pin, 1);
            basic.pause(speed);
            pins.digitalWritePin(pin, 0);
            if (i < times - 1) basic.pause(speed);
        }
    }

    // ==================== LEDs RGB ====================

    /**
     * Inicializa LED RGB com pino configurável
     */
    //% subcategory="LEDs RGB"
    //% blockId="appssed_rgb_init" block="RGB LED Inicializar |pino %pin"
    //% weight=35
    export function rgbInit(pin: DigitalPin = DEFAULT_RGB_LED_PIN): void {
        pins.digitalWritePin(pin, 0);
    }

    /**
     * Define cor do LED RGB com pino configurável
     */
    //% subcategory="LEDs RGB"
    //% blockId="appssed_rgb_color" block="RGB LED Definir cor %color |pino %pin"
    //% weight=34
    export function rgbSetColor(color: LEDColor, pin: DigitalPin = DEFAULT_RGB_LED_PIN): void {
        const colors: { [key: number]: number[] } = {
            [LEDColor.Red]: [255, 0, 0],
            [LEDColor.Green]: [0, 255, 0],
            [LEDColor.Blue]: [0, 0, 255],
            [LEDColor.Yellow]: [255, 255, 0],
            [LEDColor.Cyan]: [0, 255, 255],
            [LEDColor.Magenta]: [255, 0, 255],
            [LEDColor.White]: [255, 255, 255],
            [LEDColor.Orange]: [255, 165, 0],
            [LEDColor.Purple]: [128, 0, 128],
            [LEDColor.Off]: [0, 0, 0]
        };

        const rgb = colors[color] || [0, 0, 0];
        const data = pins.createBuffer(4);
        data[0] = 0x00;
        data[1] = rgb[0];
        data[2] = rgb[1];
        data[3] = rgb[2];

        pins.i2cWriteBuffer(pin, data);
    }

    /**
     * Define cor RGB com valores personalizados
     */
    //% subcategory="LEDs RGB"
    //% blockId="appssed_rgb_custom" block="RGB LED Definir R:%red G:%green B:%blue |pino %pin"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% weight=33
    export function rgbSetCustom(red: number, green: number, blue: number, pin: DigitalPin = DEFAULT_RGB_LED_PIN): void {
        const data = pins.createBuffer(4);
        data[0] = 0x00;
        data[1] = red;
        data[2] = green;
        data[3] = blue;
        pins.i2cWriteBuffer(pin, data);
    }

    /**
     * Efeito de fade no LED RGB
     */
    //% subcategory="LEDs RGB"
    //% blockId="appssed_rgb_fade" block="RGB LED Efeito fade %speed ms |pino %pin"
    //% speed.min=1 speed.max=50
    //% weight=32
    export function rgbFade(speed: number = 10, pin: DigitalPin = DEFAULT_RGB_LED_PIN): void {
        for (let i = 0; i < 255; i++) {
            rgbSetCustom(i, 0, 0, pin);
            basic.pause(speed);
        }
        for (let i = 255; i > 0; i--) {
            rgbSetCustom(i, 0, 0, pin);
            basic.pause(speed);
        }
    }

    /**
     * Efeito de arco-íris no LED RGB
     */
    //% subcategory="LEDs RGB"
    //% blockId="appssed_rgb_rainbow" block="RGB LED Efeito arco-íris %speed ms |pino %pin"
    //% speed.min=1 speed.max=100
    //% weight=31
    export function rgbRainbow(speed: number = 20, pin: DigitalPin = DEFAULT_RGB_LED_PIN): void {
        const colors = [
            [255, 0, 0], [255, 127, 0], [255, 255, 0],
            [0, 255, 0], [0, 0, 255], [75, 0, 130],
            [148, 0, 211]
        ];

        for (let i = 0; i < colors.length; i++) {
            const c = colors[i];
            rgbSetCustom(c[0], c[1], c[2], pin);
            basic.pause(speed);
        }
    }

    // ==================== BUZZER ====================

    /**
     * Toca um som no buzzer com pino configurável
     */
    //% subcategory="Buzzer"
    //% blockId="appssed_buzzer_tone" block="Buzzer Tocar %frequency Hz|por %duration ms |pino %pin"
    //% weight=30
    export function buzzerTone(frequency: number, duration: number = 1000, pin: DigitalPin = DEFAULT_BUZZER_PIN): void {
        pins.analogWritePin(pin, 512);
        pins.analogSetPeriod(pin, 1000000 / frequency);
        basic.pause(duration);
        pins.analogWritePin(pin, 0);
    }

    /**
     * Toca uma nota musical com pino configurável
     */
    //% subcategory="Buzzer"
    //% blockId="appssed_buzzer_note" block="Buzzer Tocar nota %note|por %duration ms |pino %pin"
    //% weight=29
    export function buzzerNote(note: string, duration: number = 500, pin: DigitalPin = DEFAULT_BUZZER_PIN): void {
        const notes: { [key: string]: number } = {
            "C4": 262, "D4": 294, "E4": 330, "F4": 349,
            "G4": 392, "A4": 440, "B4": 494, "C5": 523,
            "D5": 587, "E5": 659, "F5": 698, "G5": 784,
            "A5": 880, "B5": 988, "C6": 1047
        };

        const freq = notes[note] || 440;
        buzzerTone(freq, duration, pin);
    }

    /**
     * Toca uma melodia com pino configurável
     */
    //% subcategory="Buzzer"
    //% blockId="appssed_buzzer_melody" block="Buzzer Tocar melodia %melody|%tempo ms |pino %pin"
    //% weight=28
    export function buzzerMelody(melody: string[], tempo: number = 300, pin: DigitalPin = DEFAULT_BUZZER_PIN): void {
        for (let i = 0; i < melody.length; i++) {
            if (melody[i] === "R") {
                basic.pause(tempo);
            } else {
                buzzerNote(melody[i], tempo, pin);
            }
        }
    }

    // ==================== EXEMPLOS ====================

    /**
     * Exemplo: Sensor Ultrassônico com pinos configuráveis
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_ultrasonic" block="Exemplo: Sensor Ultrassônico |trigger %trig|echo %echo"
    //% weight=6
    export function exampleUltrasonic(trig: DigitalPin = DEFAULT_ULTRASONIC_TRIG, echo: DigitalPin = DEFAULT_ULTRASONIC_ECHO): void {
        lcdInit(LCD_ADDR);

        lcdClear();
        lcdShowText("Ultrassônico", 0, 0);

        while (true) {
            const dist = ultrasonicRead(trig, echo);
            lcdSetCursor(1, 0);
            lcdShowText("Dist: " + dist + "cm  ", 1, 0);

            // Indicador visual
            if (dist < 10) {
                lcdShowText("Muito perto!", 1, 10);
                rgbSetColor(LEDColor.Red);
                buzzerTone(500, 200);
            } else if (dist < 30) {
                lcdShowText("Perto      ", 1, 10);
                rgbSetColor(LEDColor.Yellow);
            } else if (dist > 0) {
                lcdShowText("Longe      ", 1, 10);
                rgbSetColor(LEDColor.Green);
            }

            basic.pause(200);
        }
    }

    /**
     * Exemplo: Todos os sensores com pinos configuráveis
     */
    //% subcategory="Exemplos"
    //% blockId="appssed_example_all_sensors" block="Exemplo: Todos os Sensores"
    //% weight=5
    export function exampleAllSensors(): void {
        lcdInit(LCD_ADDR);

        lcdClear();
        lcdShowText("Todos Sensores", 0, 0);
        basic.pause(2000);

        while (true) {
            lcdClear();

            // Ultrassônico
            const dist = ultrasonicRead();
            lcdShowText("Ultra: " + dist + "cm", 0, 0);

            // DHT11
            const temp = dht11Temperature();
            const hum = dht11Humidity();
            lcdShowText("DHT: " + temp + "°C " + hum + "%", 1, 0);

            // LM35
            const tempLM35 = temperatureRead();
            lcdShowText("LM35:" + tempLM35 + "°C", 0, 10);

            // LDR
            const light = ldrRead();
            if (light < 300) {
                lcdShowSpecialChar(CustomChar.Star, 1, 14);
            }

            basic.pause(2000);
        }
    }

    // ==================== UTILITÁRIOS ====================

    /**
     * Mapeia um valor de um intervalo para outro
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_map" block="Mapear %value|de %fromLow-%fromHigh|para %toLow-%toHigh"
    //% weight=20
    export function mapValue(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        return Math.map(value, fromLow, fromHigh, toLow, toHigh);
    }

    /**
     * Converte ângulo para PWM
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_angle_to_pwm" block="Ângulo %angle°|para PWM"
    //% angle.min=0 angle.max=180
    //% weight=19
    export function angleToPWM(angle: number): number {
        return Math.map(angle, 0, 180, 500, 2500);
    }

    /**
     * Limita um valor entre mínimo e máximo
     */
    //% subcategory="Utilitários"
    //% blockId="appssed_clamp" block="Limitar %value|entre %min e %max"
    //% weight=18
    export function clampValue(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}