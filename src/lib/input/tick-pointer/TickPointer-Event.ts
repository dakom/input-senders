import { InputEvent, InputEventSchedule, InputSender } from '../Input-Event';
import { PointerEventData, PointerEventOptions, getTriggersFromOptions, normalizePointerOptions, pointerEventDataMaker } from '../pointer/Pointer-Event';
import { TickEventData } from '../tick/Tick-Event';

/*
    Basically a combo of pointer and tick
    It only sends on ticks where there is a valid pointer event

    Intended for throttling move on browsers that don't inherently consolidate
*/

export type TickPointerEventData = TickEventData & PointerEventData;

export const TickPointerSourceId = "tickPointer";


export const startTickPointer = (_opts?: PointerEventOptions) => (send: InputSender) => {
    let lastTs;
    let lastPointerEvent: MouseEvent = null;

    const opts = normalizePointerOptions(_opts);

    const makePointerData = pointerEventDataMaker(opts);

    const onTick = (frameTs) => {
        if (lastPointerEvent !== null) {
            const pointerEventData = makePointerData(lastPointerEvent);
            const dt = lastTs === undefined ? 0 : ((frameTs - lastTs) / 1000);
            lastTs = frameTs;
            lastPointerEvent = null;
            if (pointerEventData !== null) {
                send({
                    sourceId: TickPointerSourceId,
                    schedule: opts.schedule,
                    data: {
                        ...pointerEventData,
                        frameTs: frameTs,
                        dt: dt
                    },
                });
            }
        }
        requestAnimationFrame(onTick);
    }

    requestAnimationFrame(onTick);

    const capture = false;

    const triggers = getTriggersFromOptions(opts);
   
    const callback = (evt: MouseEvent) => {
        if (!evt.defaultPrevented) {
            lastPointerEvent = evt;
        }

        evt.preventDefault();
    }

    triggers.forEach(trigger => {
        opts.domElement.addEventListener(trigger, callback, capture);
    });

    return () => {
        triggers.forEach(trigger => {
            opts.domElement.removeEventListener(trigger, callback, capture);
        });
    }
}
