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
