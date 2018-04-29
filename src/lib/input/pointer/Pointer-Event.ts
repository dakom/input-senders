import { InputEvent, InputEventSchedule, InputSender } from '../Input-Event';
import { getClientCoordsFromPointerEvent, flipPointerCoordsY} from '../Input-Utils';


export const PointerSourceId = "pointer";

export type PointerEventValidator = (data: PointerEventData) => boolean;

export enum PointerEventStatus {
    START = 1,
    MOVE = 2,
    END = 3,
    UNKNOWN = 4
}

export interface PointerEventData {
    status: PointerEventStatus,
    x:number;
    y:number;
};

export interface PointerEventOptions {
    domElement: HTMLElement;
    hasPointer?:boolean;
    status:PointerEventStatus;
    validate?: (evt: PointerEventData) => boolean;
    schedule?:InputEventSchedule;
    autoFlipY?:boolean;
}

export const getTriggersFromOptions = (opts:PointerEventOptions):Array<string> => {
    switch(opts.status) {
        case PointerEventStatus.START:
            return opts.hasPointer
                ?   ["pointerdown"]
                :   ["mousedown", "touchstart"]
        case PointerEventStatus.MOVE:
            return opts.hasPointer
                ?   ["pointermove"]
                :   ["mousemove", "touchmove"]
        case PointerEventStatus.END:
            return opts.hasPointer
                ?   ["pointerup"]
                :   ["mouseup", "touchend"]
    }

    return []
}

export const normalizePointerOptions = (opts?:PointerEventOptions):PointerEventOptions => {

    if(opts === undefined) {
        opts = {} as PointerEventOptions;
    }

    if(opts.hasPointer === undefined) {
        opts.hasPointer = (window as any).PointerEvent ? true : false;
    }
    return opts;
}

export const pointerEventDataMaker = (opts: PointerEventOptions) => {
    const getCoords = (opts.autoFlipY === true) ? flipPointerCoordsY(opts.domElement) : n => n;

    return (evt: MouseEvent): PointerEventData => {
        const { x, y } = getCoords(getClientCoordsFromPointerEvent(evt));
        const data: PointerEventData = {
            status: opts.status,
            x: x,
            y: y,
        };

        const result =
            (opts.validate != null && !opts.validate(data))
                ? null 
                : data;

        //console.log(result);
        return result;
    }
}

export const pointerEventMaker = (opts: PointerEventOptions) => {
    const dataMaker = pointerEventDataMaker(opts);

    return (evt: MouseEvent): InputEvent => {
        
        const data = 
            evt.defaultPrevented
                ?   null 
                :   dataMaker(evt);
        
        evt.preventDefault();

        if(data === null) {
            return null;
        }

        return {
            sourceId: PointerSourceId,
            schedule: opts.schedule,
            data: data,
            ts: evt.timeStamp
        }
    }
}

export const startPointer = (_opts?: PointerEventOptions) => (send:InputSender) => {
    const opts = normalizePointerOptions(_opts);
    const makeEvent = pointerEventMaker(opts);

    const sendEvent = rawEvent => {
        const evt = makeEvent(rawEvent);
        if(evt !== null) {
            send(evt);
        }
    }

    const triggers = getTriggersFromOptions(opts);
    const capture = false;

    triggers.forEach(trigger => {
        opts.domElement.addEventListener(trigger, sendEvent, capture);
    });
   
    return () => {
        triggers.forEach(trigger => {
            opts.domElement.removeEventListener(trigger, sendEvent, capture);
        });
    }
}
