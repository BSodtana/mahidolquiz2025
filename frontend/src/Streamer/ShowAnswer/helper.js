import axios from "axios"
import { ENDPOINT } from "../../config"

const FetchAnswer = async (q_id) => {
  try {
    const ans = await axios.get(`${ENDPOINT}/answer/score/answers/${q_id}/`);
    return Array.isArray(ans.data?.data) ? ans.data.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const FetchScore = async (q_id) => {
  try {
    const answers = await axios.get(`${ENDPOINT}/answer/score/${q_id}/`);
    return answers.data?.data ?? { question_data: [], score: [] };
  } catch (err) {
    console.error(err);
    return { question_data: [], score: [] };
  }
};

const FetchFlowerStates = async () => {
  try {
    const res = await axios.get(`${ENDPOINT}/flower/states`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const FetchQuestionData = async (question_id) => {
  try {
    const question = await axios.get(`${ENDPOINT}/questions/${question_id}/`);
    return question.data?.data ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export { FetchAnswer, FetchScore, FetchQuestionData, FetchFlowerStates };
