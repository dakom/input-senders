import { KeyboardEventData } from './Keyboard-Event';

//if supplied will only calm those keys, otherwise it calms all
export const makeKeyboardCalmValidator = (keysToCalm?:Array<string>) => {
    const evtMap = new Map<string, KeyboardEventData>();

    const isEqual = data1 => data2 => {
        return data1.status === data2.status;
    }

    return (evtData:KeyboardEventData) => {
        const isValid = 
            (
                (keysToCalm === undefined || keysToCalm.indexOf(evtData.key) !== -1)
                    && evtMap.has(evtData.key)
            )
                ? !isEqual(evtMap.get(evtData.key)) (evtData)
                : true
        
        evtMap.set(evtData.key, evtData);
        
        return isValid;
    }
}