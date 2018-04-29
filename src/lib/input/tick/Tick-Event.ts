import { InputEvent, InputEventSchedule, InputSender } from '../Input-Event';

export interface TickEventData {
    frameTs:number;
    dt:number;
};

export const TickSourceId = "tick";

export interface TickEventOptions {
    schedule?:InputEventSchedule;
}

const normalize = (opts?:TickEventOptions):TickEventOptions => {

    if(opts === undefined) {
        opts = {} as TickEventOptions;
    }

    return opts;
}

export const startTick = (_opts?:TickEventOptions) => (send:InputSender) =>  {
    let lastTs;
    let tickId = null;

    const opts = normalize(_opts);

    const onTick = (frameTs) => { 
        if(tickId !== null) {
            const evtData:TickEventData = {
                frameTs: frameTs,
                dt: lastTs === undefined ? 0 : ((frameTs -lastTs)/1000)
            }
            lastTs = frameTs;
        
            send({
                sourceId: TickSourceId,
                schedule: opts.schedule,
                data: evtData,
                ts: performance.now()
            })

            tickId = requestAnimationFrame(onTick);
        }
    }

    tickId = requestAnimationFrame(onTick);

    return () => {
        if(tickId !== null) {
            cancelAnimationFrame(tickId);
            tickId = null;
        }
    }
}
