import React, { Component } from 'react';

import { connect } from "react-redux";

import Header from '../components/Header';
import styles from './styles/Questions';
import Question from '../components/Question';
import Seperator from '../components/Seperator';
import WhiteBlank from '../components/WhiteBlank';
import Button, { FloatButton } from '../components/Button';
import TextInput from '../components/TextInput';
import validate, {
  existence,
  questionTitleLength,
  questionContentLength,
} from '../utils/validations';

class Questions extends Component {

  state = {
    show_create_question: false,
  }

  componentDidMount() {
    if (this.props.questions.length == 0) {
      this.props.getAll();
    }
  }

  render() {
    return (
      <div style={styles.container}>
        <Header avatarSrc={require('../assets/imgs/avatar_default.jpg')} />
        <div style={styles.scrollable}>
          <WhiteBlank h={20} />
          {this.props.questions
            // 这里question列表的显示逻辑比较复杂，因此我们把questions列表分出来写成一个组件，从而使主组件更简洁。
            ? <QuestionList questions={this.props.questions} />
            : null
          }
        </div>
        <FloatButton style={styles.button_add} onClick={() => this._create_question_ref && this._create_question_ref.show()} />
        <CreateQuestion ref={this._createQuestionRef} />
      </div>
    );
  }

  _createQuestionRef = (ref) => {
    this._create_question_ref = ref;
  }

}

const mapState = state => ({
  questions: state.questions,
});
const mapDispatch = ({ questions: { getAll } }) => ({
  getAll: () => getAll(),
});
export default connect(mapState, mapDispatch)(Questions);

// 组件QuestionList只用在这一个页面，所以我们就不export了
function QuestionList(props) {
  if (props.questions) {
    // 这一段逻辑是在question中间插入分隔线，但最后一个question后面没有分隔线
    let arr_question = props.questions.map((question) => {
      return (
        <Question
          key={"question_" + question.id}
          title={question.title}
          content={question.content}
          style={styles.question} />
      );
    });
    let arr_mixed = [];
    for (let i = 0; i < arr_question.length - 1; i++) {
      arr_mixed.push(arr_question[i]);
      arr_mixed.push(<Seperator key={"seperator_" + i} />);
    }
    arr_mixed.push(arr_question[arr_question.length - 1]);

    return (
      <div style={styles.question_list_container}>
        {arr_mixed}
      </div>
    );
  } else {
    return null;
  }
}

class CreateQuestion extends Component {

  static VALIDATIONS = {
    title: [existence, questionTitleLength],
    content: [questionContentLength],
  }

  state = {
    should_show: false,
  }

  render() {
    if (this.state.should_show) {
      return (
        <div
          style={styles.container_create_question}
          onClick={() => this.hide()}>
          <div
            style={styles.panel_create_question}
            onClick={(event) => {
              event.stopPropagation();
            }}>
            <TextInput id="title" style={styles.title_create_question} errMsg={this.state['title_err']} onBlur={this.onBlur} onChange={this.onChange} placeholder="Title" />
            <WhiteBlank w={8} />
            <TextInput id="content" style={styles.content_create_question} errMsg={this.state['content_err']} onBlur={this.onBlur} onChange={this.onChange} placeholder="Content" />
            <div style={styles.blank} />
            <Button label="Ask" style={styles.button_create_question} />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  onSubmit = () => {
    // validate each input, get error message
    let _errMsgs = {}
    CreateQuestion.VALIDATIONS.forEach(({ validations, id }) => {
      if (validations) {
        _errMsgs[id + '_err'] = validate(validations, this.input_values[id])
      }
    })

    // only try to setState when there are validation errors
    if (this._checkErr(_errMsgs)) {
      this.setState(_errMsgs)
    } else {
      
    }
  }

  // trigger when user typing words
  onChange = ({ target: { id, value } }) => {
    this.input_values[id] = value;
    // Reset the error message when user typing
    if (this.state[id + '_err']) {
      this.setState({ [id + '_err']: '' })
    }
  }

  // check the input existence on input blur
  onBlur = ({ target: { id, value } }) => {
    const first_validation = CreateQuestion.VALIDATIONS[id][0]
    if (first_validation.name === 'required') {
      this.setState({
        [id + '_err']: validate(first_validation, value)
      })
    }
  }

  show = () => {
    this.setState({ should_show: true });
  }
  hide = () => {
    this.setState({ should_show: false });
  }

  // check if there is a error message
  _checkErr = obj => {
    // traverse the obj, if there is any valid error message, return true
    for (let val in obj) {
      if (obj[val]) return true
    }
    return false
  }

}
