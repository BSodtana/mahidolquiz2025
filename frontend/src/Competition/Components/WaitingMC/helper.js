import axios from "axios"
import { ENDPOINT } from "../../../config"
import toast from "react-hot-toast"

const FetchQuestionData = async (question_id) =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/${question_id}/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
} 

const limitScore = (score) => {
        return Math.max(3, Math.min(score, 7));
};

const changeFlowerState = async (user_id, b_flower, a_flower, text, question_id) => {
    try{
        await axios.post(`${ENDPOINT}/flower/change/`, {user_id: user_id,b_flower: b_flower, a_flower: a_flower, text: text, question_id: question_id})
    }catch(err){
        console.log(err)
        throw err;
    }
}

const updateItemFlower = async (user_id, item_type, question_id, setvalue) => {
    try{
        const itemData = await getItemData(user_id, item_type);
        const ItemRealtime = await GetItemRealtime(user_id);
        const flowerState = await getFlowerState(user_id);
        console.log(itemData.is_used);
        //await UseItemFlower(user_id, 0, question_id)
        if(itemData.is_used > 0 && ItemRealtime.now_item == "NONE"){
            if (window.confirm('คุณต้องการใช้ไอเท็มใช่หรือไม่?')) {
                if(item_type === "ADD"){
                    await PostItemRealtime(user_id, "ADD", 0)
                    await changeFlowerState(user_id, flowerState, limitScore(flowerState + 1), "Add Flower by Item", question_id);
                }else if(item_type === "REVIVE"){
                    if(flowerState < 5){
                        await PostItemRealtime(user_id, "REVIVE", 0)
                        await changeFlowerState(user_id, flowerState, 5, "Reset Flower by Item", question_id);
                    }else{
                        toast.error("หน่วยดอกไม้ของคุณยังไม่ต่ำกว่า 5 ดอก");
                        setvalue(false)
                        return
                    }
                }else if(item_type === "SHIELD"){
                    await PostItemRealtime(user_id, "SHIELD", 0)
                }
                await axios.post(`${ENDPOINT}/flower/fetch/item/`, {user_id: user_id, item_type: item_type, question_id:question_id, is_used:itemData.is_used - 1})
                toast.success(`คุณใช้ไอเท็ม ${item_type} สำเร็จ`)
                setvalue(true)
            }
        }else if(ItemRealtime.now_item != 0){
            toast.error("คุณได้ใช้ไอเท็มนี้ไปแล้วในข้อนี้")
            setvalue(true)
        }else{
            toast.error("คุณไม่มีไอเท็มนี้ในครอบครอง")
            setvalue(true)
        }
    }catch(err){
        setvalue(false)
        console.log(err)
        throw err;
    }
}

const UseItemFlower = async (user_id, item_used, question_id) => {
    try{
        await axios.post(`${ENDPOINT}/flower/use/item/`, {user_id: user_id, item_used: item_used, question_id:question_id})
    }catch(err){
        console.log(err)
        throw err;
    }
}

const PostItemRealtime = async (user_id, item_used, is_send) => {
    try{
        await axios.post(`${ENDPOINT}/flower/use/item/realtime`, {user_id: user_id, item_used: item_used, is_send: is_send})
    }catch(err){
        console.log(err)
        throw err;
    }
}

const GetItemRealtime = async (user_id) => {
    try {
        let data = await axios.get(`${ENDPOINT}/flower/get/item/realtime/${user_id}/`);
        return data.data.data;
    }catch (err) {
        console.error(err);
    }
}

const getFlowerState = async (user_id) => {
    try {
        let data = await axios.get(`${ENDPOINT}/flower/states/${user_id}/`);
        return data.data.data.current_units;
    }catch (err) {
        console.error(err);
    }
}

const getItemData = async (user_id, item_type) => {
    try {
        let response = await axios.get(`${ENDPOINT}/flower/get/item/${user_id}/${item_type}/`);
        return response.data.data;
    }catch (err) {
        console.error(err);
    }
}

export {FetchQuestionData, updateItemFlower, getItemData, UseItemFlower, GetItemRealtime}