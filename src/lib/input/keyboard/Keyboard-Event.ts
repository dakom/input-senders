
import { InputEvent, InputEventSchedule, InputSender } from '../Input-Event';

export interface KeyboardEventData {
    status: KeyboardEventStatus,
    key: string
};

export enum KeyboardEventStatus {
    PRESS = 1,
    RELEASE = 2
}

export const KeyboardSourceId = "keyboard";

export type KeyboardEventValidator = (data:KeyboardEventData) => boolean;

export interface KeyboardEventOptions {
    validate?:(evt:KeyboardEventData) => boolean
    schedule?:InputEventSchedule;
}

const eventMaker = (opts?:KeyboardEventOptions) => (evt:KeyboardEvent):InputEvent => {
    const data = {
        status: evt.type === "keyup" ? KeyboardEventStatus.RELEASE : KeyboardEventStatus.PRESS,
        key: evt.key
    };

    const result = 
        (evt.defaultPrevented || (opts.validate !== null && !opts.validate(data)))
        ?   null
        :   {
                sourceId: KeyboardSourceId,
                schedule: opts.schedule,
                data: data,
                ts: evt.timeStamp
            }

    // Cancel the default action to avoid it being handled twice (from mozilla docs)
    evt.preventDefault();

    return result;
}

const normalize = (opts?:KeyboardEventOptions):KeyboardEventOptions => {

    if(opts === undefined) {
        opts = {} as KeyboardEventOptions;
    }

    if(opts.validate === undefined) {
        opts.validate = null;
    }

    return opts;
}

export const startKeyboard = (opts?:KeyboardEventOptions) => (send:InputSender) => {
    const makeEvent = eventMaker(normalize(opts));

    const sendEvent = rawEvent => {
        const evt = makeEvent(rawEvent);
        if(evt !== null) {
            send(evt);
        }
    }

    const capture = true;

    document.addEventListener("keydown", sendEvent, capture);
    document.addEventListener("keyup", sendEvent, capture);

    return () => {
        document.removeEventListener("keydown", sendEvent, capture);
        document.removeEventListener("keyup", sendEvent, capture);
    }
}
