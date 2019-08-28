import React from 'react';
import { Menu, Icon } from 'antd';

class SelectionArea extends  React.Component{
	handleClick = (parm) => {
		console.log(parm)
		this.props.onMenuChange(parm.key);
	}
	render(){
		return (
				<Menu theme = "dark" mode="inline" defaultSelectedKeys = {['1']} onClick = {this.handleClick}>
				  <Menu.Item key = "1">
				    <Icon type = "user" />
				    <span> Artist </span>
				  </Menu.Item>
				  <Menu.Item key = "2">
				    <Icon type = "audio" />
				    <span> Song Title </span>
				  </Menu.Item>
				  <Menu.Item key = "3">
				    <Icon type = "link" />
				    <span> Song Id </span>
				  </Menu.Item>
				</Menu>
			);
	}
}

export default SelectionArea;