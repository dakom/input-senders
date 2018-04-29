import { PointerEventData } from './pointer/Pointer-Event';
import { ScreenEventData } from './screen/Screen-Event';
import { TickPointerEventData } from './tick-pointer/TickPointer-Event';
import { TickEventData } from './tick/Tick-Event';

export interface InputEvent {
    sourceId: string;
    schedule?: InputEventSchedule;
    data?: any;
    ts?: number;
}

export enum InputEventSchedule {
    IMMEDIATE = "immediate",
    MICROTASK = "microtask",
    NEXTFRAME = "nextFrame"
}

export type InputSender = (evt: InputEvent) => void;

export interface InputSenderOptions {
    defaultSchedule?: InputEventSchedule;
    fillTimestamp?: boolean;
    send: InputSender;
}

export const makeScheduledInputSender = (opts: InputSenderOptions): InputSender => {
    if (opts.defaultSchedule === undefined) {
        opts.defaultSchedule = InputEventSchedule.IMMEDIATE
    }

    return (evt: InputEvent) => {
        if (evt.schedule === undefined) {
            evt.schedule = opts.defaultSchedule;
        }
        if (evt.ts === undefined && opts.fillTimestamp === true) {
            evt.ts = performance.now();
        }
        switch (evt.schedule) {
            case InputEventSchedule.IMMEDIATE:
                opts.send(evt);
                break;
            case InputEventSchedule.MICROTASK:
                Promise.resolve().then(() => opts.send(evt));
                break;
            case InputEventSchedule.NEXTFRAME:
                setTimeout(() => opts.send(evt), 0);
                break;
        }
    }
}

/* Useful unions */
export type TickScreenEventData = TickEventData & ScreenEventData;
export type PointerScreenEventData = PointerEventData & ScreenEventData;
export type TickPointerScreenEventData = TickPointerEventData & ScreenEventData;