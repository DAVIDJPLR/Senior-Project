import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

interface Props{
    setSearchVal: (val: string) => void;
    searchVal: string;
    handleKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    size: 'small' | 'medium';
}

function SearchBar({setSearchVal, searchVal, handleKeyUp, size}: Props){
    return(
        <TextField variant="outlined" size={size} sx={{width: "90%", "& .MuiOutlinedInput-root": {borderRadius: 8}, backgroundColor: "white", borderRadius: "30px", color: "black"}} 
        onChange={(e) => setSearchVal(e.target.value)}
        value={searchVal}
        className="HaveShadow"
        onKeyUp={handleKeyUp}
        slotProps={{
            input: {
                startAdornment: 
                    <InputAdornment position="start">
                        <SearchIcon/>
                    </InputAdornment>
            }
        }}/>
    );
}

export default SearchBar;