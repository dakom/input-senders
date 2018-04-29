import {PointerEventData} from './Pointer-Event';

export const makePointerCalmValidator = () => {
    let lastValidPointer:PointerEventData;

    const isEqual = data1 => data2 => {
        return data1.status === data2.status 
            && data1.x === data2.x
            && data1.y === data2.y;
    }

    return (evtData:PointerEventData) => {
        const isValid = 
            lastValidPointer !== undefined
                ? !isEqual(lastValidPointer) (evtData)
                : true

        lastValidPointer = evtData;
        
        return isValid;
    }
}