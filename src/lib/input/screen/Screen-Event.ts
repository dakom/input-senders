import { InputEvent, InputEventSchedule, InputSender } from '../Input-Event';


export const getWindowSize = ():ScreenEventData => ({
    width: window.innerWidth,
    height: window.innerHeight
});
export interface ScreenEventData {
    width: number;
    height: number;
};

export const ScreenSourceId = "screen";

export interface ScreenEventOptions {
    sendInitial?:boolean;
    schedule?:InputEventSchedule;
    getScreenSize: () => ScreenEventData;
}

const eventMaker = (opts:ScreenEventOptions) => (evt:Event):InputEvent => {

    const result = 
        (evt.defaultPrevented)
        ? null
        : {
            sourceId: ScreenSourceId,
            schedule: opts.schedule,
            data: opts.getScreenSize(),
            ts: evt.timeStamp
        }

    // Cancel the default action to avoid it being handled twice (from mozilla docs)
    evt.preventDefault();

    return result;
}

const normalize = (opts?:ScreenEventOptions):ScreenEventOptions => {

    if(opts === undefined) {
        opts = {} as ScreenEventOptions;
    }

    opts.sendInitial = (opts.sendInitial === true) ? true : false;

    return opts;
}

export const startScreen = (_opts?:ScreenEventOptions) => (send:InputSender) =>  {
    const opts = normalize(_opts);
    const makeEvent = eventMaker(opts);



    const sendEvent = rawEvent => {
        const evt = makeEvent(rawEvent);
        if(evt !== null) {
            send(evt);
        }
    }

    const capture = true;

    window.addEventListener("resize", sendEvent, capture);

    if(opts.sendInitial) {
        send({
                sourceId: ScreenSourceId,
                schedule: opts.schedule,
                data: opts.getScreenSize()
        })
    }

    return window.removeEventListener("resize", sendEvent, capture);
}
