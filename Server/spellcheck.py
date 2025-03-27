from symspellpy import SymSpell

sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)

sym_spell.load_dictionary("custom_dictionary.txt", term_index=0, count_index=1)

def correct_query(query: str) -> str:
    suggestions = sym_spell.lookup_compound(query.lower(), max_edit_distance=2)
    return suggestions[0].term if suggestions else query