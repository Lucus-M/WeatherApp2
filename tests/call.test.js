/**
 * @jest-environment jsdom
 */
const {
    toFahrenheit,
    isValidInput,
    processWeatherData,
    updateHTML,
    logWeatherData
} = require('../call.js');

// Mock DOM elements
beforeEach(() => {
document.body.innerHTML = `
    <div class="date"></div>
    <div class="date"></div>
    <div class="date"></div>
    <img class="dayImg" />
    <img class="dayImg" />
    <img class="dayImg" />
    <img class="nightImg" />
    <img class="nightImg" />
    <img class="nightImg" />
    <span class="dayTemp"></span>
    <span class="dayTemp"></span>
    <span class="dayTemp"></span>
    <span class="nightTemp"></span>
    <span class="nightTemp"></span>
    <span class="nightTemp"></span>
`;
});

describe('toFahrenheit', () => {
test('converts Kelvin to Fahrenheit correctly', () => {
    expect(toFahrenheit(273.15)).toBe(32);
    expect(toFahrenheit(300)).toBe(80);
});

test('handles invalid input gracefully', () => {
    expect(toFahrenheit(null)).toBe('N/A');
    expect(toFahrenheit(undefined)).toBe('N/A');
    expect(toFahrenheit("A")).toBe('N/A');
});
});

describe('isValidInput', () => {
test('accepts valid 5-digit zip code', () => {
    expect(isValidInput('12345')).toBe(true);
});

test('rejects empty input', () => {
    window.alert = jest.fn();
    expect(isValidInput('')).toBe(false);
    expect(window.alert).toHaveBeenCalledWith("Zip field cannot be empty.");
});

test('rejects invalid zip code format', () => {
    window.alert = jest.fn();
    expect(isValidInput('1234')).toBe(false);
    expect(isValidInput('abcde')).toBe(false);
    expect(window.alert).toHaveBeenCalledWith("Invalid Zip Code. Please enter a 5-digit zip code.");
});
});

describe('processWeatherData', () => {
    const sampleData = {
        list: Array.from({ length: 24 }, (_, i) => ({
        dt_txt: `2025-01-${String(Math.floor(i / 8) + 1).padStart(2, '0')} 12:00:00`,
        main: { temp: 280 + i },
        weather: [{ main: i % 2 === 0 ? 'Clear' : 'Cloudy' }]
        }))
    };

    //happy path
    test('processes and updates HTML without errors', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
        processWeatherData(sampleData);
        expect(document.querySelector('.date').innerText).toMatch(/2025-01-\d{2}/);
        spy.mockRestore();
    });

    //unhappy path
    test('handles missing data gracefully', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        processWeatherData({}); // missing list
        expect(spy).toHaveBeenCalledWith("Error processing weather data");
        spy.mockRestore();
    });
});

describe('updateHTML', () => {
    // happy path
    test('updates DOM elements correctly', () => {
        const dailyTemps = [
            {
                date: '2025-01-28',
                dayTemp: 285,
                nightTemp: 275,
                dayCondition: 'Clear',
                nightCondition: 'Cloudy'
            },
            {
                date: '2025-01-29',
                dayTemp: 286,
                nightTemp: 276,
                dayCondition: 'Clear',
                nightCondition: 'Cloudy'
            },
            {
                date: '2025-01-30',
                dayTemp: 287,
                nightTemp: 277,
                dayCondition: 'Clear',
                nightCondition: 'Cloudy'
            }
        ];

        updateHTML(dailyTemps);

        const dateElems = document.getElementsByClassName('date');
        expect(dateElems[0].innerText).toBe('2025-01-28');

        const dayTempElems = document.getElementsByClassName('dayTemp');
        expect(dayTempElems[0].innerText).toMatch(/\d+°F/);

        const imgElems = document.getElementsByClassName('dayImg');
        expect(imgElems[0].src).toMatch(/Clear\.png$/);
    });

    // unhappy path
    test('handles errors gracefully when DOM elements are missing or data is malformed', () => {
        // Clear the DOM to simulate a failure scenario
        document.body.innerHTML = '';

        // Mock logWeatherData to prevent it from throwing in this test
        const originalLogWeatherData = logWeatherData;
        global.logWeatherData = jest.fn();

        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Bad input: array with missing fields
        updateHTML([{ bad: 'data' }]);

        expect(spy.mock.calls[0][0]).toMatch("Error updating HTML:");

        spy.mockRestore();
        global.logWeatherData = originalLogWeatherData; // restore
    });
});

describe('logWeatherData', () => {
    //happy path
    test('logs weather data without error', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const data = [
        {
            date: '2025-01-28',
            dayTemp: 280,
            nightTemp: 270,
            dayCondition: 'Rain',
            nightCondition: 'Clear'
        }
        ];

        logWeatherData(data);
        expect(spy).toHaveBeenCalledWith(expect.stringMatching(/Date: 2025-01-28/));
            spy.mockRestore();
    });

    //unhappy path
    test('handles logging error gracefully', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        logWeatherData(null); // invalid input
        expect(spy.mock.calls[0][0]).toMatch("Error logging weather data");
        spy.mockRestore();
    });
});