import socket as skt

HOST, PORT = '', 8888

listen_socket = skt.socket(skt.AF_INET, skt.SOCK_STREAM)
listen_socket.setsockopt(skt.SOL_SOCKET, skt.SO_REUSEADDR, 1)
listen_socket.bind((HOST, PORT))
listen_socket.listen(1)
print('Serving HTTP on port %s ...' % PORT)
while True:
    client_connection, client_address = listen_socket.accept()
    request = client_connection.recv(1024)
    print(request)

    http_response = """
HTTP/1.1 200 OK
 
Hello, World!
"""
    client_connection.send(http_response.encode())  # sendall(http_response)
    client_connection.close()

# print("end")
