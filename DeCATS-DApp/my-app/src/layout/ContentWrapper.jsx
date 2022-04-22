import style from './ContentWrapper.module.scss';

const ContentWrapper = ({ children }) => {
    return (
        <div id={style['content-wrap']}>{children}</div>
    )
}

export default ContentWrapper