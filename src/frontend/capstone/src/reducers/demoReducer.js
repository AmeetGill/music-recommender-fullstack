import { DEMO } from '../actions/types';

export default function( state = "" , action ){
	switch(action.type){
		case DEMO:
			return "hello, this is for demo";
		default:
			return " default demo";
	}
}