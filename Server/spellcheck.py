from symspellpy import SymSpell

sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)

sym_spell.load_dictionary("custom_dictionary.txt", term_index=0, count_index=1)

def correct_query(query: str) -> str:
    '''Uses SymSpell to correct the spelling of a given query, based on a custom dictionary derived from our article database.'''
    ## lookup_compound checks an entire phrase rather than individual words; no need for individual checking on our end
    suggestions = sym_spell.lookup_compound(query.lower(), max_edit_distance=2)
    return suggestions[0].term if suggestions else query