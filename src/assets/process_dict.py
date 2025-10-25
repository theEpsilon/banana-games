import re
import json

result = []
printdict = {}

with open('wordnet-core.txt', 'r') as file:
    for line in file:
        matchstr = re.search(r"\[[a-z]*\]", line)
        if(matchstr is not None):
            string = matchstr.group()[1:-1]
            if len(string) in printdict:
                printdict[len(string)].append(string)
            else:
                printdict[len(string)] = [string]

with open('wordnet-core.json', 'w') as writefile:
    writefile.write(json.dumps(printdict))
