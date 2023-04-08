import unittest
import requests

class TestAPI(unittest.TestCase):
    def __init__(self):
        self.api_mutations = "https://dvfapp.fly.dev/api/count/mutations/97418"
        self.api_typelocal = "https://dvfapp.fly.dev/api/count/typelocal/97418"

    def test_fonctionnement_API_mutations(self):
        response = requests.get(self.api_mutations)
        self.assertEquals(response.status_code, 200)
    
    def test_fonctionnement_API_type_local(self):
        response = requests.get(self.api_type_local)
        self.assertEquals(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
