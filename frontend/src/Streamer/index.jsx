import React from 'react';
import StreamerWelcome from './AwaitQuestion';
import QuestionSelect from './QuestionSelect';
import StreamerWaitMc from './QuestionSelected';
import StreamerCountdown from './Countdown'
import StreamerSocket from './socket';
import ShowAnswer from './ShowAnswer';
import StreamerScore from './Score';
import DisplayRule from './Rule';

function StreamerRoutes() {

   const [, currentStatus, currentQuestion, questionOwner, timeLeft,] = StreamerSocket()
    if (currentStatus === "WELCOME") return (<StreamerWelcome />)
    else if (currentStatus === "SELECT_QUESTION") return (<QuestionSelect QUESTION_OWNER={questionOwner} />)
    else if (currentStatus === "AWAIT_MC") return (<StreamerWaitMc CURRENT_QUESTION={currentQuestion} />)
    else if (currentStatus === "START_QUESTION") return (<StreamerCountdown TIME_LEFT={timeLeft} CURRENT_QUESTION={currentQuestion} />)
    else if (currentStatus === "REVIEW_QUESTION") return (<StreamerCountdown TIME_LEFT={0} CURRENT_QUESTION={currentQuestion} />)
    else if (currentStatus === "AWAIT_SCORE" || currentStatus === "SHOW_SUMMARY") return (<ShowAnswer QUESTION_OWNER={questionOwner} CURRENT_QUESTION={currentQuestion} CURRENT_STATUS={currentStatus} />)
    else if (currentStatus === "REVEAL_SCORE") return (<StreamerScore />)
    else if (currentStatus === "DISPLAY_RULE") return (<DisplayRule />)
    else {
        return <StreamerWelcome />
    }

}

export default StreamerRoutes