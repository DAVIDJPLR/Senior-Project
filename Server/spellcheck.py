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
    
def expand_query(terms: list[str]):
    sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
    dict_path = "custom_dictionary.txt"
    sym_spell.load_dictionary(dict_path, 0, 1)
    
    expanded_terms = set(terms)
    for term in terms:
        similar_terms = expand_term(term, sym_spell)
        expanded_terms.update(similar_terms)
    
    return list(expanded_terms)

def expand_term(term, sym_spell, max_expansion=3, max_edit_distance=2):
        suggestions = sym_spell.lookup(term, verbosity=all, max_edit_distance=max_edit_distance)
        similar_terms = []
        for suggestion in suggestions:
            if suggestion.term != term:
                similar_terms.append((suggestion.term, suggestion.distance))
        
        similar_terms = sorted(similar_terms, key=lambda x: (x[1], len(x[0])))[:max_expansion]
        return [term for term, _ in similar_terms]
    