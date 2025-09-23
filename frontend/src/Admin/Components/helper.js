import axios from "axios";
import { ENDPOINT } from "../../config";
import toast from "react-hot-toast"

const FetchAllQuestion = async () =>{
    try{
        let question = await axios.get(`${ENDPOINT}/questions/list/`)
        return question.data.data
    }catch(err){
        console.log(err)
    }
}

const ResetFlower = async () =>{
    try{
        if(window.confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตดอกไม้ของผู้เล่นทุกคน?")){
            await axios.post(`${ENDPOINT}/flower/reset/flower`, {flower_reset: 5, now_item: "NONE", is_send: 0})
            toast.success("รีเซ็ตดอกไม้ของผู้เล่นทุกคนเรียบร้อย")
        }
    }catch(err){
        console.log(err)
    }
}

const ResetStatusQuestion = async () =>{
    try{
        if(window.confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตสถานะคำถามของผู้เล่นทุกคน?")){
            await axios.post(`${ENDPOINT}/flower/reset2/flower`, {now_item: "NONE", is_send: 0})
            toast.success("รีเซ็ตสถานะคำถามของผู้เล่นทุกคนเรียบร้อย")
        }
    }catch(err){
        console.log(err)
    }
}

const ResetItem = async () =>{
    try{
        if(window.confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตไอเท็มของผู้เล่นทุกคน?")){
            await axios.post(`${ENDPOINT}/flower/reset/item`, {add: 2})
            toast.success("รีเซ็ตไอเท็มของผู้เล่นทุกคนเรียบร้อย")
        }
    }catch(err){
        console.log(err)
    }
}

export {FetchAllQuestion, ResetFlower, ResetItem, ResetStatusQuestion}