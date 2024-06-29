import {toZonedTime} from 'date-fns-tz'
import type { PointSetting, VIPSetting} from "~/class/store.class";
export type DefaultIntervalType = 'day' | 'month' | 'week' | 'year';

export const de_vipSetting = {
    milestoneType: 'point',
    program_reset_time: -1,
    program_reset_interval: 'month',
    program_start: now(),
    status: false,
} as VIPSetting

export const de_pointSetting = {
    currency: {
        plural: 'Points',
        singular: 'Point',
    },
    point_expiry_time: -1,
    point_expiry_interval: 'month',
    status: true,
} as PointSetting

export const de_listEarnPointProgram = [
    {
        type: 'place_an_order/money_spent',
        icon: 'https://cdn-icons-png.flaticon.com/32/2435/2435281.png',
        name: 'Complete an order',
        point_value: 5,
        limit_usage: -1,
        customer_eligibility: "null",
        limit_reset_interval: "day",
        limit_reset_value: 1,
        status: true,
    },
    {
        type: 'happy_birthday',
        icon: 'https://cdn-icons-png.flaticon.com/32/6479/6479517.png',
        name: 'Happy Birthday',
        point_value: 150,
        limit_usage: -1,
        customer_eligibility: "null",
        limit_reset_interval: "day",
        limit_reset_value: 1,
        status: false,
    },
    {
        type: 'sign_in',
        icon: 'https://cdn-icons-png.flaticon.com/32/10479/10479877.png',
        name: 'Sign In',
        point_value: 200,
        limit_usage: -1,
        customer_eligibility: "null",
        limit_reset_interval: "day",
        limit_reset_value: 1,
        status: false,
    }
]

export function now() {
    return new Date();
}

export function convertToTitleCase(str: string) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });
}
export function convertSnakeString(str: string) {
    return str.replace(/_/g, ' ').trim();
}
export function isStringInteger(str: string) {
    if(/^\d+$/.test(str)){
        const number = parseInt(str);
        return number > 0;
    }
    return false;
}
export function isPositiveFloat(str: string) {
    if (/[^0-9.]/.test(str)) {
        return false;
    }

    const number = parseFloat(str);

    return !Number.isNaN(number) && number > 0;
}

export function isUnsignedFloat(str: string) {
    if (/[^0-9.]/.test(str)) {
        return false;
    }

    const number = parseFloat(str);

    return !Number.isNaN(number) ;
}

export function getTimeZone(date: Date, timezone: string) {
    return toZonedTime(date, timezone);
}
export function generateRandomString(length: number, prefix = "") {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return prefix + result;
}

export function escapeJsonString(jsonString: string) {
    return jsonString.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
