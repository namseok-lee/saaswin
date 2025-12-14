import React from 'react';
import './my-node.css';

const MyNode = ({ nodeData }) => {
    // nodeData의 기본값 설정
    const name = nodeData.name || '이름 없음';
    const title = nodeData.title || '직책 없음';

    return (
        <div className="node">
            <div className="info">
                <div className="ryg"></div>
                <div className="profile-pic">
                    <img className="prof-pic" alt="Profile" src="/img/kakaofriend.jpeg" />
                </div>
                <div className="details">
                    <div className="name">{name}</div>
                    <div className="designation">{title}</div>
                    <div className="team"></div>
                </div>
            </div>
        </div>
    );
};

export default MyNode;
