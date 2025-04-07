from symspellpy import SymSpell

def correct_query(query: str) -> str:
    '''Uses SymSpell to correct the spelling of a given query, based on a custom dictionary derived from our article database.'''
    sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)

    dict_path = "custom_dictionary.txt"

    sym_spell.load_dictionary(dict_path, 0, 1)
    
    suggestions = sym_spell.lookup_compound(query.lower(), max_edit_distance=2)
    if suggestions:
        return suggestions[0].term
    else:
        return query